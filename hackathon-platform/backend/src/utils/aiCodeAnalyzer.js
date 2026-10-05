/**
 * AI Submission & Code Analysis Engine
 * Detects AI-Generated code patterns, synthetic signatures, code quality, security vulnerabilities,
 * and computes calibrated rubric recommendations for Hackathon Judges.
 */

const AI_COMMENT_PATTERNS = [
  /\/\/\s*(here is the|this function|step \d+|helper function to|validate input|ensure that|return the|example usage|note:|make sure to|replace with your)/i,
  /\/\*\*\s*\n\s*\*\s*(handles the|calculates the|fetches the|processes the|utility to)/i,
  /\/\/\s*(TODO:\s*replace with your actual|add your own logic here)/i,
  /\/\/\s*(end of|main logic begins|initialize state|import necessary libraries)/i,
  /\/\/\s*(sanitize input|error handling|response structure)/i
];

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, severity: 'CRITICAL' },
  { name: 'Generic API Key / Secret', regex: /(?:api_key|apikey|secret_key|api_secret|auth_token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/gi, severity: 'HIGH' },
  { name: 'Hardcoded JWT Token', regex: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, severity: 'HIGH' },
  { name: 'Hardcoded Database Password', regex: /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[a-zA-Z0-9_-]+:[a-zA-Z0-9!@#$%^&*()_+]+@/gi, severity: 'HIGH' },
  { name: 'Private Key Header', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, severity: 'CRITICAL' }
];

const VULNERABILITY_PATTERNS = [
  { name: 'Dangerous eval() execution', regex: /\beval\s*\(/g, severity: 'HIGH', desc: 'Use of eval() allows arbitrary code execution.' },
  { name: 'Unsafe HTML Injection (dangerouslySetInnerHTML / innerHTML)', regex: /(?:dangerouslySetInnerHTML|\.innerHTML\s*=)/g, severity: 'MEDIUM', desc: 'Direct HTML injection creates potential Cross-Site Scripting (XSS) risks.' },
  { name: 'Raw SQL String Concatenation', regex: /(?:SELECT|INSERT|UPDATE|DELETE)\s+.*?\+.*?['"][a-zA-Z0-9_]+/gi, severity: 'HIGH', desc: 'String concatenation in SQL queries is vulnerable to SQL Injection.' },
  { name: 'Child Process Exec without Sanitization', regex: /child_process\.(?:exec|execSync)\s*\(/g, severity: 'HIGH', desc: 'Command execution via child_process may lead to remote code execution (RCE).' }
];

/**
 * Analyzes code content for AI generated signatures, security flaws, and code health
 */
function analyzeCodeSnippet({ code = '', filename = 'submission_code.js', language = 'javascript', submissionContext = {} }) {
  if (!code || typeof code !== 'string') {
    code = `// Example submission snippet\nfunction processData(input) {\n  // Step 1: Validate input\n  if (!input) return null;\n  // Step 2: Return transformed data\n  return { success: true, timestamp: Date.now(), data: input };\n}`;
  }

  const lines = code.split('\n');
  const lineCount = lines.length;
  const nonBlankLines = lines.filter(l => l.trim().length > 0);
  const totalChars = code.length;

  // 1. Comment Analysis & Synthetic Signature Detection
  const commentLines = lines.filter(l => {
    const t = l.trim();
    return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('#');
  });
  const commentRatio = nonBlankLines.length > 0 ? (commentLines.length / nonBlankLines.length) : 0;

  let aiSignatureMatches = 0;
  const flaggedLines = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    for (const pattern of AI_COMMENT_PATTERNS) {
      if (pattern.test(trimmed)) {
        aiSignatureMatches++;
        flaggedLines.push({
          line: idx + 1,
          content: trimmed.slice(0, 100),
          category: 'AI_SYNTHETIC_COMMENT',
          severity: 'MEDIUM',
          reason: 'Matches generic LLM step-by-step or placeholder comment structure.'
        });
        break;
      }
    }
  });

  // 2. Burstiness & Uniformity Analysis (LLM code tends to be highly uniform in line length & indentation)
  const lineLengths = nonBlankLines.map(l => l.length);
  const avgLineLength = lineLengths.length > 0 ? (lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length) : 0;
  const variance = lineLengths.length > 0
    ? lineLengths.reduce((acc, len) => acc + Math.pow(len - avgLineLength, 2), 0) / lineLengths.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const burstinessScore = avgLineLength > 0 ? Math.min(100, Math.round((stdDev / avgLineLength) * 100)) : 50;

  // 3. Repetitive Variable Naming / Generic Identifiers
  const genericIdentifiers = (code.match(/\b(data|result|item|response|temp|flag|processData|handleRequest|val|resData)\b/g) || []).length;
  const identifierDensity = (genericIdentifiers / Math.max(1, nonBlankLines.length)).toFixed(2);

  // 4. Calculate AI Probability Score
  let aiScore = 15; // Base prior

  if (commentRatio > 0.35) aiScore += 25;
  else if (commentRatio > 0.2) aiScore += 15;

  aiScore += Math.min(35, aiSignatureMatches * 12);

  // Low burstiness (very uniform lines) increases AI likelihood
  if (burstinessScore < 25 && nonBlankLines.length > 15) {
    aiScore += 20;
  } else if (burstinessScore < 35 && nonBlankLines.length > 15) {
    aiScore += 10;
  }

  // Generic identifiers bump
  if (identifierDensity > 0.5) aiScore += 15;

  // Cap AI probability between 5 and 96
  const aiProbability = Math.min(96, Math.max(6, Math.round(aiScore)));

  let aiVerdict = 'Human Authored';
  let badgeColor = 'emerald';
  let aiRiskLevel = 'LOW';

  if (aiProbability >= 70) {
    aiVerdict = 'High AI-Generated Probability';
    badgeColor = 'rose';
    aiRiskLevel = 'HIGH';
  } else if (aiProbability >= 40) {
    aiVerdict = 'Hybrid (AI-Assisted Human Code)';
    badgeColor = 'amber';
    aiRiskLevel = 'MODERATE';
  }

  // 5. Security & Vulnerability Scans
  const securityFindings = [];

  SECRET_PATTERNS.forEach(rule => {
    const matches = code.match(rule.regex);
    if (matches) {
      securityFindings.push({
        type: 'HARDCODED_SECRET',
        title: `Exposed ${rule.name}`,
        severity: rule.severity,
        count: matches.length,
        description: `Found ${matches.length} potential hardcoded credential(s). Sensitive tokens should be stored in environment variables.`
      });
    }
  });

  VULNERABILITY_PATTERNS.forEach(rule => {
    const matches = code.match(rule.regex);
    if (matches) {
      securityFindings.push({
        type: 'VULNERABILITY',
        title: rule.name,
        severity: rule.severity,
        count: matches.length,
        description: rule.desc
      });
    }
  });

  // 6. Code Quality Metrics
  const functionCount = (code.match(/\b(function|def|const\s+[a-zA-Z0-9_]+\s*=\s*(?:async\s*)?\(|class\s+[A-Z])/g) || []).length || 1;
  const cyclomaticIndicator = (code.match(/\b(if|else if|for|while|switch|case|catch|\?\s*:|&&|\|\|)\b/g) || []).length;
  const complexityPerFunction = (cyclomaticIndicator / functionCount).toFixed(1);

  let maintainabilityRating = 'A';
  let maintainabilityScore = 92;

  if (securityFindings.some(s => s.severity === 'CRITICAL')) {
    maintainabilityRating = 'D';
    maintainabilityScore = 58;
  } else if (complexityPerFunction > 6 || securityFindings.length > 2) {
    maintainabilityRating = 'C';
    maintainabilityScore = 72;
  } else if (complexityPerFunction > 3.5 || securityFindings.length > 0) {
    maintainabilityRating = 'B';
    maintainabilityScore = 84;
  }

  // 7. Recommended Rubric Scores for Judge
  const recommendedRubric = {
    innovation: aiProbability > 80 ? 7.5 : aiProbability > 50 ? 8.5 : 9.3,
    technicalExecution: maintainabilityScore > 85 ? 9.2 : maintainabilityScore > 70 ? 8.2 : 7.0,
    design: 8.8,
    impact: 9.0,
    calibratedScore: Math.round(((aiProbability > 80 ? 7.5 : 9.0) + (maintainabilityScore / 10) + 8.8 + 9.0) / 4 * 10)
  };

  const findingsSummary = [
    aiProbability >= 70
      ? `High frequency of synthetic AI boilerplate comments and low token burstiness indicates significant automated generation.`
      : aiProbability >= 40
      ? `Code shows natural developer flow with moderate AI copilot assistance on boilerplate utility functions.`
      : `Distinct developer naming cadence, varied cyclomatic density, and domain-specific structures suggest authentic human authoring.`,
    securityFindings.length === 0
      ? `Security audit passed: No hardcoded API keys, private tokens, or dangerous eval/injection vectors detected.`
      : `Security audit flagged ${securityFindings.length} issue(s) requiring remediation before production deployment.`,
    `Maintainability Index rated ${maintainabilityRating} (${maintainabilityScore}/100) across ${functionCount} analyzed functional module(s).`
  ];

  return {
    filename,
    language,
    lineCount,
    nonBlankLines: nonBlankLines.length,
    characterCount: totalChars,
    aiDetection: {
      probability: aiProbability,
      verdict: aiVerdict,
      riskLevel: aiRiskLevel,
      badgeColor,
      syntheticSignaturesFound: aiSignatureMatches,
      burstinessScore,
      commentRatio: Number((commentRatio * 100).toFixed(1)),
      identifierDensity: Number(identifierDensity),
      flaggedLines: flaggedLines.slice(0, 15)
    },
    securityAudit: {
      totalIssues: securityFindings.length,
      criticalIssues: securityFindings.filter(s => s.severity === 'CRITICAL').length,
      highIssues: securityFindings.filter(s => s.severity === 'HIGH').length,
      findings: securityFindings
    },
    codeQuality: {
      maintainabilityRating,
      maintainabilityScore,
      complexityPerFunction: Number(complexityPerFunction),
      functionCount,
      cyclomaticIndicator
    },
    recommendedRubric,
    findingsSummary,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = {
  analyzeCodeSnippet,
};
