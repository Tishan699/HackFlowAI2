/**
 * AI Judge Evaluator Engine
 * Analyzes applicant credentials, technical expertise, seniority, and judging history.
 * Provides an objective AI scorecard and recommendation to assist the Organizer in final role approval.
 */

const EXPERTISE_DOMAINS = {
  'Machine Learning': ['ai', 'ml', 'machine learning', 'deep learning', 'nlp', 'llm', 'computer vision', 'pytorch', 'tensorflow'],
  'Cloud & Systems': ['cloud', 'aws', 'gcp', 'azure', 'kubernetes', 'docker', 'devops', 'distributed systems', 'scalability'],
  'Fullstack & Web': ['react', 'node', 'fullstack', 'frontend', 'backend', 'typescript', 'javascript', 'api', 'graphql'],
  'Cybersecurity': ['security', 'cryptography', 'cyber', 'pentesting', 'infosec', 'zero trust'],
  'UI/UX & Product': ['design', 'ui/ux', 'product', 'figma', 'user experience', 'interaction design', 'accessibility'],
  'FinTech & Web3': ['fintech', 'blockchain', 'web3', 'smart contracts', 'ethereum', 'solidity', 'crypto', 'banking']
};

function analyzeJudgeApplication(application) {
  const {
    name = '',
    experienceYears = 0,
    title = '',
    organization = '',
    expertise = '',
    previousJudging = '',
    linkedinUrl = '',
    portfolioUrl = '',
    reason = '',
    hackathonTitle = 'Hackathon'
  } = application;

  const years = Number(experienceYears) || 0;
  const expLower = (expertise + ' ' + title + ' ' + previousJudging + ' ' + reason).toLowerCase();

  // 1. Detect Domain Match
  const detectedDomains = [];
  for (const [domain, keywords] of Object.entries(EXPERTISE_DOMAINS)) {
    const matches = keywords.filter(kw => expLower.includes(kw));
    if (matches.length > 0) {
      detectedDomains.push({ domain, matchesCount: matches.length });
    }
  }

  // 2. Experience Score (Max 100)
  let experienceScore = 50;
  if (years >= 8) experienceScore = 96;
  else if (years >= 5) experienceScore = 90;
  else if (years >= 3) experienceScore = 80;
  else if (years >= 1) experienceScore = 68;
  else experienceScore = 55;

  const experienceRating = experienceScore >= 85 ? 'High' : experienceScore >= 70 ? 'Medium' : 'Low';

  // 3. Domain Expertise Score (Max 100)
  let domainScore = 60;
  if (detectedDomains.length >= 3) domainScore = 94;
  else if (detectedDomains.length >= 2) domainScore = 88;
  else if (detectedDomains.length === 1) domainScore = 78;
  else domainScore = 65;

  const domainRating = domainScore >= 85 ? 'High' : domainScore >= 70 ? 'Medium' : 'Low';

  // 4. Relevant Skills Score (Max 100)
  const hasSeniorTitle = /(lead|senior|principal|head|director|founder|architect|vp|researcher)/i.test(title);
  let skillsScore = 70;
  if (hasSeniorTitle && detectedDomains.length >= 2) skillsScore = 95;
  else if (hasSeniorTitle) skillsScore = 88;
  else if (detectedDomains.length >= 2) skillsScore = 84;
  else skillsScore = 74;

  const skillsRating = skillsScore >= 85 ? 'High' : skillsScore >= 70 ? 'Medium' : 'Low';

  // 5. Profile Completeness (Max 100)
  let completeness = 40;
  if (name.trim()) completeness += 10;
  if (organization.trim()) completeness += 10;
  if (title.trim()) completeness += 10;
  if (linkedinUrl.trim().startsWith('http')) completeness += 15;
  if (previousJudging.trim().length > 15) completeness += 10;
  if (reason.trim().length > 25) completeness += 5;
  completeness = Math.min(completeness, 100);

  // 6. Judging Track Record
  const hasPastJudging = /(judged|evaluated|mentor|judge|hackathon|speaker|panelist)/i.test(previousJudging);
  const previousJudgingRating = hasPastJudging ? 'High' : (previousJudging.trim() ? 'Medium' : 'Low');

  // 7. AI Recommendation Synthesis
  const compositeScore = Math.round((experienceScore * 0.35) + (domainScore * 0.35) + (skillsScore * 0.30));
  
  let recommendation = '';
  let suitability = 'Recommended';
  let badgeColor = 'emerald';

  const primaryDomainNames = detectedDomains.map(d => d.domain).slice(0, 2).join(' & ');

  if (compositeScore >= 85) {
    suitability = 'Strongly Recommended';
    badgeColor = 'emerald';
    recommendation = `Highly qualified candidate with ${years}+ years seniority. Strongly recommended for technical and architecture evaluation${primaryDomainNames ? ' focusing on ' + primaryDomainNames : ''}.`;
  } else if (compositeScore >= 70) {
    suitability = 'Suitable for Judging';
    badgeColor = 'indigo';
    recommendation = `Solid background with relevant industry experience. Well-suited for product innovation, UI/UX, or junior track evaluation.`;
  } else {
    suitability = 'Requires Verification';
    badgeColor = 'amber';
    recommendation = `Candidate has entry-level background or incomplete profile. Organizer review recommended before assigning scoring authority.`;
  }

  return {
    evaluatedAt: new Date().toISOString(),
    compositeScore,
    domainExpertise: domainRating,
    domainScore,
    previousExperience: experienceRating,
    experienceScore,
    relevantSkills: skillsRating,
    skillsScore,
    previousJudgingRating,
    profileCompleteness: completeness,
    detectedDomains: detectedDomains.map(d => d.domain),
    aiRecommendation: recommendation,
    suitability,
    badgeColor,
    isSeniorRole: hasSeniorTitle,
  };
}

module.exports = {
  analyzeJudgeApplication
};
