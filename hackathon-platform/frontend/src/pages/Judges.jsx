import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UserCheck,
  Star,
  Award,
  CheckCircle2,
  Shield,
  X,
  Sliders,
  Sparkles,
  Send,
  UserPlus,
  Clock,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Mail,
  FileCode,
  Code2,
  Scan,
  ShieldAlert,
  Terminal,
  Copy,
  FileText,
  CheckCheck,
  Search,
  Zap,
  UploadCloud,
  Cpu,
  Layers,
  Flame,
  Bug
} from "lucide-react";
import { hackathonService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SAMPLE_AI_CODE = `/**
 * @file userAnalyticsService.js
 * Here is the complete implementation of the analytics pipeline.
 */

// Step 1: Import required express dependencies
const express = require('express');

// Step 2: Helper function to process incoming telemetry payload
function processData(input) {
  // Validate input parameters
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid input payload provided' };
  }

  // Step 3: Compute aggregate metrics
  let totalScore = 0;
  for (let i = 0; i < (input.metrics || []).length; i++) {
    totalScore += input.metrics[i];
  }

  // Step 4: Return formatted JSON response structure
  return {
    success: true,
    totalScore,
    average: totalScore / Math.max(1, (input.metrics || []).length),
    timestamp: new Date().toISOString()
  };
}

// Step 5: Export functional utility
module.exports = { processData };
`;

const SAMPLE_HUMAN_CODE = `import React, { useState, useEffect, useCallback } from 'react';
import { fetchTelemetryLogs } from '../api/telemetry';

export function SensorGrid({ gatewayId, onAnomalyDetected }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const pollSensors = useCallback(async () => {
    try {
      const { data } = await fetchTelemetryLogs(gatewayId);
      setReadings(data.slice(-50));
      
      const spikes = data.filter(r => r.psi > 120.5);
      if (spikes.length > 0) {
        onAnomalyDetected(spikes[spikes.length - 1]);
      }
    } catch (err) {
      console.warn('Telemetry poll transient fail, retrying next tick', err.message);
    } finally {
      setLoading(false);
    }
  }, [gatewayId, onAnomalyDetected]);

  useEffect(() => {
    pollSensors();
    const interval = setInterval(pollSensors, 3000);
    return () => clearInterval(interval);
  }, [pollSensors]);

  if (loading) return <div className="animate-pulse">Connecting to IoT Gateway...</div>;
  return <div>{readings.length} Active Nodes Live</div>;
}
`;

const SAMPLE_VULNERABLE_CODE = `const express = require('express');
const router = express.Router();

// Hardcoded API token for quick development test
const AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE";
const DB_AUTH = "mongodb+srv://admin:SuperSecretPass123!@cluster.mongodb.net";

router.post('/execute-dynamic', (req, res) => {
  const { userScript, queryParam } = req.body;
  
  // Unsafe evaluation of dynamic user input
  const evalResult = eval(userScript);

  // Raw SQL concatenation vulnerability
  const rawQuery = "SELECT * FROM participants WHERE team_id = '" + queryParam + "'";

  res.json({ output: evalResult, queryExecuted: rawQuery });
});

module.exports = router;
`;

export default function Judges() {
  const [searchParams] = useSearchParams();
  const inviteTokenFromUrl = searchParams.get("inviteToken");

  const { user, isJudgeFor, isOrganizerFor, refreshProfile } = useAuth();

  const [judges, setJudges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [scores, setScores] = useState({
    innovation: 9,
    technicalExecution: 9,
    design: 8.5,
    impact: 9,
    feedback: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorToast, setErrorToast] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // RBAC Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);

  // AI Submission & Code Analysis Tool state
  const [showAiCodeModal, setShowAiCodeModal] = useState(false);
  const [analyzingCode, setAnalyzingCode] = useState(false);
  const [codeToAnalyze, setCodeToAnalyze] = useState(SAMPLE_AI_CODE);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [codeFilename, setCodeFilename] = useState("submission_main.js");
  const [targetSubmissionId, setTargetSubmissionId] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeAnalyzerTab, setActiveAnalyzerTab] = useState("code"); // 'code' | 'upload' | 'samples'
  const [copiedReport, setCopiedReport] = useState(false);

  // Data states
  const [applications, setApplications] = useState([]);
  const [myJudgeStatus, setMyJudgeStatus] = useState(null);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [invitingJudge, setInvitingJudge] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});

  // Application Form
  const [applyForm, setApplyForm] = useState({
    experienceYears: 5,
    organization: "",
    title: "",
    expertise: "Machine Learning, Cloud Systems, Fullstack",
    linkedinUrl: "",
    portfolioUrl: "",
    previousJudging: "",
    reason: "",
    hackathonId: "1",
  });

  // Invite Form
  const [inviteForm, setInviteForm] = useState({
    email: "",
    judgeName: "",
    roleDescription: "Distinguished Technical Judge",
    expertise: "Fullstack Architecture & Scalability",
    personalMessage: "We would be honored to have your expertise on our judging panel.",
    hackathonId: "1",
  });

  const isOrganizer = isOrganizerFor("1") || user?.role === "organizer";
  const isJudge = isJudgeFor("1") || user?.role === "judge";

  useEffect(() => {
    loadData();
    if (inviteTokenFromUrl) {
      handleAcceptInviteFromUrl(inviteTokenFromUrl);
    }
  }, [inviteTokenFromUrl]);

  const loadData = async () => {
    try {
      const [jList, sList] = await Promise.all([
        hackathonService.getJudges(),
        hackathonService.getSubmissions(),
      ]);
      setJudges(jList);
      setSubmissions(sList);

      // Load logged-in user judge status
      if (user) {
        const status = await hackathonService.getMyJudgeStatus();
        setMyJudgeStatus(status);
      }

      // Load applications if organizer
      if (isOrganizer) {
        const apps = await hackathonService.getJudgeApplications();
        setApplications(apps);
      }
    } catch (err) {
      console.error("Error loading judging data:", err);
    }
  };

  const handleAcceptInviteFromUrl = async (token) => {
    try {
      const res = await hackathonService.acceptJudgeInvitation(token);
      setSuccessToast(res.message || "Judging invitation accepted successfully!");
      if (refreshProfile) refreshProfile();
      loadData();
    } catch (err) {
      setErrorToast(err.message || "Failed to accept judge invitation.");
    }
  };

  // Submit Application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmittingApp(true);
    try {
      const res = await hackathonService.applyForJudge({
        ...applyForm,
        name: user?.name,
        email: user?.email,
      });
      setSuccessToast("Application submitted! The AI screening engine evaluated your credentials and sent your application to the Organizer for review.");
      setShowApplyModal(false);
      loadData();
    } catch (err) {
      setErrorToast(err.message || "Failed to submit judge application.");
    } finally {
      setSubmittingApp(false);
    }
  };

  // Organizer Reviews Application
  const handleReviewDecision = async (appId, decision) => {
    setReviewingId(appId);
    try {
      const notes = reviewNotes[appId] || "";
      await hackathonService.reviewJudgeApplication(appId, decision, notes);
      setSuccessToast(`Application ${decision === "APPROVE" ? "Approved" : "Rejected"} successfully!`);
      if (refreshProfile) refreshProfile();
      loadData();
    } catch (err) {
      setErrorToast(err.message || "Failed to process review.");
    } finally {
      setReviewingId(null);
    }
  };

  // Organizer Direct Invite
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInvitingJudge(true);
    try {
      await hackathonService.inviteJudge(inviteForm);
      setSuccessToast(`Official invitation dispatched to ${inviteForm.email}!`);
      setShowInviteModal(false);
      setInviteForm({
        email: "",
        judgeName: "",
        roleDescription: "Distinguished Technical Judge",
        expertise: "Fullstack Architecture & Scalability",
        personalMessage: "We would be honored to have your expertise on our judging panel.",
        hackathonId: "1",
      });
      loadData();
    } catch (err) {
      setErrorToast(err.message || "Failed to send invitation.");
    } finally {
      setInvitingJudge(false);
    }
  };

  // Handle Score Modal Open (RBAC Guard)
  const handleOpenScoreModal = (sub) => {
    // SECURITY CHECK: Disallow non-judges from entering scoring modal
    if (!isJudge && !isOrganizer) {
      setShowAccessDeniedModal(true);
      return;
    }

    setSelectedSub(sub);
    setScores({
      innovation: sub.judgeScores?.innovation || 9,
      technicalExecution: sub.judgeScores?.technicalExecution || 9,
      design: sub.judgeScores?.design || 8.5,
      impact: sub.judgeScores?.impact || 9,
      feedback: sub.judgeFeedback || "",
    });
  };

  // Handle Score Submit
  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSaving(true);

    try {
      await hackathonService.scoreSubmission(selectedSub.id, scores);
      setSuccessToast(`Evaluation for ${selectedSub.title} saved successfully.`);
      setSelectedSub(null);
      loadData();
    } catch (err) {
      setErrorToast(err.message || "You are not authorized to score this project.");
    } finally {
      setSaving(false);
    }
  };

  // Handle AI Code Analyzer Open
  const handleOpenCodeAnalyzer = (sub = null) => {
    if (sub) {
      setTargetSubmissionId(sub.id);
      setSelectedSub(sub);
      setCodeFilename(`${sub.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_main.js`);
      
      const stack = Array.isArray(sub.techStack) ? sub.techStack.join(', ') : 'React, Node.js';
      const synthesizedSnippet = `/**
 * @project ${sub.title}
 * @team ${sub.teamName}
 * @techStack ${stack}
 * @description ${sub.description || ''}
 */

// Step 1: Initialize core service pipeline handler
async function handleSubmissionWorkflow(inputPayload) {
  // Validate request parameters
  if (!inputPayload || typeof inputPayload !== 'object') {
    return { success: false, error: "Invalid payload input" };
  }

  // Step 2: Execute domain processing algorithm
  try {
    const calculationResult = await executeTelemetryInference(inputPayload);
    return {
      status: 200,
      body: calculationResult,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("Error occurred while processing:", err);
    return { success: false, error: err.message };
  }
}

module.exports = { handleSubmissionWorkflow };`;
      setCodeToAnalyze(synthesizedSnippet);
    } else {
      setTargetSubmissionId("");
      if (!codeToAnalyze) setCodeToAnalyze(SAMPLE_AI_CODE);
    }
    setShowAiCodeModal(true);
  };

  // Run AI Code Analysis
  const handleRunCodeAnalysis = async () => {
    setAnalyzingCode(true);
    setErrorToast("");
    try {
      const res = await hackathonService.analyzeCode({
        code: codeToAnalyze,
        filename: codeFilename,
        language: selectedLanguage,
        submissionId: targetSubmissionId || undefined,
      });

      if (res?.analysis) {
        setAnalysisResult(res.analysis);
        setSuccessToast(`Code analysis complete: ${res.analysis.aiDetection.verdict} (${res.analysis.aiDetection.probability}% AI probability)`);
      }
    } catch (err) {
      setErrorToast(err.message || "Failed to analyze code snippet.");
    } finally {
      setAnalyzingCode(false);
    }
  };

  // Sync AI Calibrated Score to Judging Rubric
  const handleApplyAiScoreToRubric = () => {
    if (!analysisResult) return;
    const rec = analysisResult.recommendedRubric;
    setScores(prev => ({
      ...prev,
      innovation: rec.innovation || prev.innovation,
      technicalExecution: rec.technicalExecution || prev.technicalExecution,
      design: rec.design || prev.design,
      impact: rec.impact || prev.impact,
      feedback: `[AI Code Inspection Report]:\n- AI Generation Probability: ${analysisResult.aiDetection.probability}% (${analysisResult.aiDetection.verdict})\n- Code Maintainability: Grade ${analysisResult.codeQuality.maintainabilityRating} (${analysisResult.codeQuality.maintainabilityScore}/100)\n- Security Audit: ${analysisResult.securityAudit.totalIssues === 0 ? "Passed Clean" : `${analysisResult.securityAudit.totalIssues} issue(s) detected`}\n\n${analysisResult.findingsSummary.join('\n')}`
    }));

    setShowAiCodeModal(false);
    setSuccessToast("AI Code Analysis calibrated rubric transferred to scoring form!");
  };

  // Handle File Upload into Analyzer
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCodeFilename(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) setSelectedLanguage('javascript');
    else if (['py'].includes(ext)) setSelectedLanguage('python');
    else if (['java'].includes(ext)) setSelectedLanguage('java');
    else if (['cpp', 'c', 'cs'].includes(ext)) setSelectedLanguage('cpp');
    else if (['html', 'css'].includes(ext)) setSelectedLanguage('html');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCodeToAnalyze(content);
        setActiveAnalyzerTab('code');
        setSuccessToast(`File '${file.name}' loaded (${content.split('\n').length} lines). Click 'Run AI Detection' to scan.`);
      }
    };
    reader.readAsText(file);
  };

  // Load Preset Samples
  const handleLoadSample = (type) => {
    if (type === 'ai') {
      setCodeToAnalyze(SAMPLE_AI_CODE);
      setCodeFilename('ai_generated_service.js');
      setSelectedLanguage('javascript');
      setAnalysisResult(null);
    } else if (type === 'human') {
      setCodeToAnalyze(SAMPLE_HUMAN_CODE);
      setCodeFilename('SensorGrid.jsx');
      setSelectedLanguage('javascript');
      setAnalysisResult(null);
    } else if (type === 'vulnerable') {
      setCodeToAnalyze(SAMPLE_VULNERABLE_CODE);
      setCodeFilename('vulnerable_api.js');
      setSelectedLanguage('javascript');
      setAnalysisResult(null);
    }
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const reportText = `====================================
HACKFLOW AI CODE & SUBMISSION AUDIT
====================================
File: ${analysisResult.filename} (${analysisResult.lineCount} lines)
AI Generation Probability: ${analysisResult.aiDetection.probability}%
Verdict: ${analysisResult.aiDetection.verdict}
Risk Level: ${analysisResult.aiDetection.riskLevel}
Maintainability Index: ${analysisResult.codeQuality.maintainabilityRating} (${analysisResult.codeQuality.maintainabilityScore}/100)
Security Issues Found: ${analysisResult.securityAudit.totalIssues}
Recommended Rubric Score: ${analysisResult.recommendedRubric.calibratedScore}/100

Key Findings:
${analysisResult.findingsSummary.map(f => `• ${f}`).join('\n')}
====================================`;

    navigator.clipboard?.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // User's latest application status (if any)
  const myApp = myJudgeStatus?.applications?.[0];
  const pendingAppsCount = applications.filter((a) => a.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* Toast Notifications */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast("")} className="text-emerald-600 hover:text-emerald-900 p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {errorToast && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast("")} className="text-rose-600 hover:text-rose-900 p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header & Role Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#120c0b] border border-red-950/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Judging Panel & Rubric Calibration
            </h1>
            <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-800/40 text-orange-400 text-xs font-bold uppercase tracking-wider">
              RBAC Verified
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1.5 max-w-2xl">
            Evaluate project submissions with calibrated multi-criteria rubrics. Privileged judge roles are governed by organizer invitation and verified credential workflows.
          </p>
        </div>

        {/* Action Buttons based on User Role */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Code & Synthetic Detector Tool Button (Always available to Judges & Organizers) */}
          <button
            onClick={() => handleOpenCodeAnalyzer()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60 border border-orange-400/30 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Scan size={15} className="animate-pulse" />
            <span>AI Code & AI-Generated Detector Lab</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] uppercase tracking-wider font-extrabold">
              AI Tool
            </span>
          </button>

          {/* Organizer Controls */}
          {isOrganizer && (
            <>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-[#1c1211] hover:bg-red-950/60 border border-red-900/40 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Mail size={14} /> Invite Judge
              </button>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/50 border border-orange-400/20 transition relative cursor-pointer"
              >
                <Brain size={14} /> Review Applications
                {pendingAppsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-extrabold animate-pulse">
                    {pendingAppsCount} New
                  </span>
                )}
              </button>
            </>
          )}

          {/* Participant / Candidate Controls */}
          {!isOrganizer && !isJudge && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-red-950/50 border border-orange-400/30 transition cursor-pointer"
            >
              <Award size={14} /> Apply as Judge
            </button>
          )}

          {isJudge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 size={15} className="text-emerald-400" /> Authorized Judge
            </div>
          )}
        </div>
      </div>

      {/* Participant Judge Application Status Banner */}
      {!isOrganizer && myApp && (
        <div className={`p-5 rounded-2xl border text-sm flex items-start justify-between gap-4 ${
          myApp.status === "PENDING"
            ? "bg-[#1c1211] border-amber-500/40 text-amber-300"
            : myApp.status === "APPROVED"
            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
            : "bg-[#170e0d] border-red-950 text-zinc-400"
        }`}>
          <div className="flex items-start gap-3">
            {myApp.status === "PENDING" ? (
              <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
            ) : myApp.status === "APPROVED" ? (
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-zinc-500 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>Judge Application for {myApp.hackathonTitle}:</span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs uppercase font-extrabold ${
                  myApp.status === "PENDING"
                    ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                    : myApp.status === "APPROVED"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    : "bg-[#251513] text-zinc-400"
                }`}>
                  {myApp.status}
                </span>
              </div>
              <p className="text-xs mt-1 opacity-90 text-zinc-400">
                {myApp.status === "PENDING" && "Your credentials have been screened by the AI assistant and are awaiting final review by the event organizer. You will be notified via email once approved."}
                {myApp.status === "APPROVED" && "Your appointment as official Judge is verified and active! You may now review and score projects in the evaluation queue below."}
                {myApp.status === "REJECTED" && "Thank you for applying. Judging slots for this competition are currently filled. You retain full participant privileges."}
              </p>
            </div>
          </div>

          {myApp.status === "PENDING" && myApp.aiEvaluation && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#251513] border border-amber-500/30 text-xs font-medium text-amber-300 shrink-0">
              <Sparkles size={14} className="text-amber-400" />
              <span>AI Screening: <strong>{myApp.aiEvaluation.suitability}</strong> ({myApp.aiEvaluation.compositeScore}%)</span>
            </div>
          )}
        </div>
      )}

      {/* Judges Roster Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {judges.map((j) => (
          <div
            key={j.id}
            className="bg-[#120c0b] border border-red-950/80 hover:border-orange-500/40 rounded-2xl p-5 shadow-lg transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-red-950/50">
                {j.avatar}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{j.name}</h3>
                <p className="text-xs text-orange-400 font-medium">{j.role}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-red-950/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Expertise:</span>
                <span className="font-medium text-zinc-300 text-right">{j.expertise}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Assigned:</span>
                <span className="font-semibold text-zinc-200">{j.assignedSubmissions || 4} Projects</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Evaluations:</span>
                <span className="text-emerald-400 font-semibold">{j.completedEvaluations || 0} Completed</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submissions Queue for Judging */}
      <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-red-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-white text-base">Projects in Evaluation Queue</h2>
            <p className="text-xs text-zinc-400">Review team deliverables, scan code with AI detection, and calibrate rubric scores</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1c1211] border border-red-900/30 text-orange-300 text-xs font-medium">
            <Shield size={13} className="text-orange-400" />
            Backend RBAC Authorization Enforced
          </div>
        </div>

        <div className="divide-y divide-red-950/60">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1a100f]/60 transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{sub.title}</h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-900/40 text-orange-300">
                    {sub.teamName}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 max-w-2xl line-clamp-1">{sub.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                  <span>AI Pre-Score: <strong className="text-orange-400">{sub.aiScore}/100</strong></span>
                  <span>Judge Calibrated Score: <strong className="text-emerald-400">{sub.totalScore || "Pending"}/100</strong></span>
                  {sub.judgeName && (
                    <span className="text-zinc-500 text-[11px]">Evaluated by: <strong className="text-zinc-300">{sub.judgeName}</strong></span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* AI Code Scanner Button for this Submission */}
                <button
                  onClick={() => handleOpenCodeAnalyzer(sub)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1f1311] hover:bg-red-950/60 text-orange-300 border border-red-900/40 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Run AI-Generated Code Detection on this submission"
                >
                  <Scan size={14} className="text-orange-400" />
                  <span>Scan Code (AI Detector)</span>
                </button>

                <button
                  onClick={() => handleOpenScoreModal(sub)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs transition cursor-pointer ${
                    isJudge || isOrganizer
                      ? "bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md shadow-red-950/60 border border-orange-400/30"
                      : "bg-[#1c1211] hover:bg-red-950 text-zinc-300 border border-red-900/40"
                  }`}
                >
                  <Sliders size={14} />
                  {isJudge || isOrganizer ? "Score Project" : "View / Request Score"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACCESS DENIED MODAL (Non-Judge Tried to Score) */}
      {showAccessDeniedModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#120c0b] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-900/40 relative animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">
              Judge Authorization Required
            </h3>
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
              Your account is currently registered with <strong>Participant</strong> permissions. In accordance with platform security policies, participants cannot evaluate projects or calibrate competition scores.
            </p>
            <div className="mt-4 p-3 bg-[#1c1211] rounded-xl border border-red-950 text-xs text-zinc-300 space-y-1">
              <strong className="block font-semibold text-orange-400">How to gain Judge privileges:</strong>
              <p>1. Submit an application via <em>"Apply to Become a Judge"</em>.</p>
              <p>2. Receive an official invitation link directly from the event organizer.</p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAccessDeniedModal(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowAccessDeniedModal(false);
                  setShowApplyModal(true);
                }}
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl shadow-md cursor-pointer"
              >
                Apply for Judge Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION MODAL: Apply to Become a Judge */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#120c0b] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-red-900/40 relative my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-red-950">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Apply to Become a Judge
                </h3>
                <p className="text-xs text-zinc-400">
                  Submit your professional credentials for AI screening and Organizer approval
                </p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    required
                    value={applyForm.experienceYears}
                    onChange={(e) => setApplyForm({ ...applyForm, experienceYears: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Current Company / Org
                  </label>
                  <input
                    required
                    placeholder="e.g. Google, AWS, MIT"
                    value={applyForm.organization}
                    onChange={(e) => setApplyForm({ ...applyForm, organization: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Professional Title / Role
                </label>
                <input
                  required
                  placeholder="e.g. Staff Software Engineer / Lead AI Researcher"
                  value={applyForm.title}
                  onChange={(e) => setApplyForm({ ...applyForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Primary Technical Expertise
                </label>
                <input
                  required
                  placeholder="e.g. Machine Learning, Cloud Architecture, Fullstack, Cyber"
                  value={applyForm.expertise}
                  onChange={(e) => setApplyForm({ ...applyForm, expertise: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    LinkedIn / Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={applyForm.linkedinUrl}
                    onChange={(e) => setApplyForm({ ...applyForm, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Portfolio / GitHub
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={applyForm.portfolioUrl}
                    onChange={(e) => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Previous Hackathon Judging Experience
                </label>
                <input
                  placeholder="e.g. Judged NeurIPS 2024, MIT HackX, or University sprints"
                  value={applyForm.previousJudging}
                  onChange={(e) => setApplyForm({ ...applyForm, previousJudging: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Motivation / Judging Philosophy
                </label>
                <textarea
                  rows={2}
                  placeholder="Share why you'd like to evaluate projects and help guide the hackers..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              {/* AI Assistant Note */}
              <div className="p-3 rounded-xl bg-[#1e1311] border border-orange-500/20 text-xs text-orange-300 flex items-start gap-2.5">
                <Brain size={17} className="text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Automated AI Profile Pre-Screening:</strong>
                  <span className="block text-zinc-400 text-[11px] mt-0.5">
                    Our AI assistant will benchmark your domain expertise, profile completeness, and seniority to generate an objective scorecard for the Organizer. The organizer makes the final approval decision.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-950">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-950/60 border border-orange-400/30 cursor-pointer flex items-center gap-1.5"
                >
                  {submittingApp ? "Screening Profile..." : "Submit Application"}
                  <ChevronRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORGANIZER MODAL: Review Judge Applications (AI Scorecard + Decision) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#120c0b] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-red-900/40 relative my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-red-950">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <Brain className="text-orange-400" size={20} />
                  Organizer Review Portal: Judge Applications
                </h3>
                <p className="text-xs text-zinc-400">
                  Review applicant profiles, AI recommendation scorecards, and make final role approvals
                </p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              {applications.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No judge applications received yet for this competition.
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-red-950 bg-[#170e0d] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-950">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{app.name}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                            app.status === "PENDING"
                              ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                              : app.status === "APPROVED"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-orange-400 font-medium mt-0.5">
                          {app.title} • {app.organization} ({app.experienceYears} Years Exp)
                        </p>
                      </div>

                      {app.linkedinUrl && (
                        <a
                          href={app.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-orange-400 hover:underline"
                        >
                          LinkedIn Profile <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    {/* AI Candidate Analysis Scorecard */}
                    {app.aiEvaluation && (
                      <div className="bg-[#120c0b] rounded-xl p-4 border border-red-950 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-zinc-200">
                            <Sparkles size={14} className="text-orange-400" />
                            AI Candidate Assessment:
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                            {app.aiEvaluation.suitability} ({app.aiEvaluation.compositeScore}%)
                          </span>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 bg-[#1c1211] rounded-lg text-center border border-red-950">
                            <span className="text-[10px] text-zinc-500 block">Domain Expertise</span>
                            <strong className="text-zinc-200">{app.aiEvaluation.domainExpertise} ({app.aiEvaluation.domainScore}%)</strong>
                          </div>
                          <div className="p-2 bg-[#1c1211] rounded-lg text-center border border-red-950">
                            <span className="text-[10px] text-zinc-500 block">Relevant Skills</span>
                            <strong className="text-zinc-200">{app.aiEvaluation.relevantSkills} ({app.aiEvaluation.skillsScore}%)</strong>
                          </div>
                          <div className="p-2 bg-[#1c1211] rounded-lg text-center border border-red-950">
                            <span className="text-[10px] text-zinc-500 block">Experience Depth</span>
                            <strong className="text-zinc-200">{app.aiEvaluation.previousExperience} ({app.aiEvaluation.experienceScore}%)</strong>
                          </div>
                          <div className="p-2 bg-[#1c1211] rounded-lg text-center border border-red-950">
                            <span className="text-[10px] text-zinc-500 block">Completeness</span>
                            <strong className="text-zinc-200">{app.aiEvaluation.profileCompleteness}%</strong>
                          </div>
                        </div>

                        {/* AI Recommendation Quote */}
                        <div className="text-[11px] text-zinc-300 bg-[#1f1311] p-2.5 rounded-lg border border-orange-500/20">
                          <strong className="text-orange-400">AI Recommendation:</strong> {app.aiEvaluation.aiRecommendation}
                        </div>
                      </div>
                    )}

                    {/* Applicant Background Details */}
                    <div className="text-xs space-y-1.5 text-zinc-400">
                      <div><strong className="text-zinc-300">Expertise:</strong> {app.expertise}</div>
                      {app.previousJudging && (
                        <div><strong className="text-zinc-300">Judging History:</strong> {app.previousJudging}</div>
                      )}
                      {app.reason && (
                        <div><strong className="text-zinc-300">Motivation:</strong> <em>"{app.reason}"</em></div>
                      )}
                    </div>

                    {/* Organizer Actions (If Pending) */}
                    {app.status === "PENDING" && (
                      <div className="pt-3 border-t border-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <input
                          placeholder="Optional feedback notes for applicant..."
                          value={reviewNotes[app.id] || ""}
                          onChange={(e) => setReviewNotes({ ...reviewNotes, [app.id]: e.target.value })}
                          className="px-3 py-1.5 text-xs bg-[#1c1211] border border-red-900/40 rounded-lg text-zinc-100 outline-none flex-1"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            disabled={reviewingId === app.id}
                            onClick={() => handleReviewDecision(app.id, "REJECT")}
                            className="px-3.5 py-1.5 rounded-lg bg-[#251513] hover:bg-rose-950 text-zinc-300 hover:text-rose-300 border border-red-900/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <ThumbsDown size={13} /> Reject
                          </button>
                          <button
                            disabled={reviewingId === app.id}
                            onClick={() => handleReviewDecision(app.id, "APPROVE")}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-red-950/60 border border-orange-400/30 transition cursor-pointer flex items-center gap-1"
                          >
                            <ThumbsUp size={13} /> Approve as Judge
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORGANIZER MODAL: Direct Judge Email Invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#120c0b] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-red-900/40 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-red-950">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Invite Judge Directly
                </h3>
                <p className="text-xs text-zinc-400">
                  Send an official judge invitation link directly to the candidate's email
                </p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Judge Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="judge@gmail.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Judge Full Name
                </label>
                <input
                  placeholder="e.g. Dr. Sarah Chen"
                  value={inviteForm.judgeName}
                  onChange={(e) => setInviteForm({ ...inviteForm, judgeName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Designation / Role Description
                </label>
                <input
                  placeholder="e.g. VP of Engineering at CloudScale"
                  value={inviteForm.roleDescription}
                  onChange={(e) => setInviteForm({ ...inviteForm, roleDescription: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Personalized Invitation Message
                </label>
                <textarea
                  rows={2}
                  value={inviteForm.personalMessage}
                  onChange={(e) => setInviteForm({ ...inviteForm, personalMessage: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="p-3 bg-[#1e1311] rounded-xl border border-orange-500/20 text-xs text-orange-300 flex items-start gap-2">
                <Send size={15} className="text-orange-400 shrink-0 mt-0.5" />
                <span className="text-zinc-400">
                  The invited judge will receive an official invitation with a secure acceptance token. Once accepted, their account is granted active judging privileges for this hackathon.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-950">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invitingJudge}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-950/60 border border-orange-400/30 cursor-pointer flex items-center gap-1.5"
                >
                  {invitingJudge ? "Dispatching..." : "Send Invitation"}
                  <Send size={13} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCORE SUBMISSION MODAL (Calibrate Rubric) */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#120c0b] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-red-900/40 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-red-950">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Score: {selectedSub.title}
                </h3>
                <span className="text-xs text-orange-400 font-medium">Team {selectedSub.teamName}</span>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScoreSubmit} className="space-y-4 mt-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-300">
                  <span>Innovation & Originality (30%)</span>
                  <span className="text-orange-400 font-bold">{scores.innovation} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={scores.innovation}
                  onChange={(e) => setScores({ ...scores, innovation: Number(e.target.value) })}
                  className="w-full accent-orange-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-300">
                  <span>Technical Execution & Code (30%)</span>
                  <span className="text-orange-400 font-bold">{scores.technicalExecution} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={scores.technicalExecution}
                  onChange={(e) => setScores({ ...scores, technicalExecution: Number(e.target.value) })}
                  className="w-full accent-orange-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-300">
                  <span>Design & Usability (20%)</span>
                  <span className="text-orange-400 font-bold">{scores.design} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={scores.design}
                  onChange={(e) => setScores({ ...scores, design: Number(e.target.value) })}
                  className="w-full accent-orange-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-300">
                  <span>Real-World Impact & Feasibility (20%)</span>
                  <span className="text-orange-400 font-bold">{scores.impact} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={scores.impact}
                  onChange={(e) => setScores({ ...scores, impact: Number(e.target.value) })}
                  className="w-full accent-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Judge Feedback for Team
                </label>
                <textarea
                  rows={2}
                  placeholder="Constructive feedback for the team..."
                  value={scores.feedback}
                  onChange={(e) => setScores({ ...scores, feedback: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-[#170e0d] border border-red-950 rounded-xl text-center">
                <span className="text-xs text-zinc-400">Calculated Overall Score:</span>
                <div className="text-2xl font-black text-orange-400 font-heading">
                  {Math.round(((scores.innovation + scores.technicalExecution + scores.design + scores.impact) / 4) * 10)}/100
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-950">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-950/60 border border-orange-400/30 cursor-pointer"
                >
                  {saving ? "Submitting..." : "Save Evaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI SUBMISSION CODE ANALYZER & AI-GENERATED CODE DETECTOR MODAL */}
      {showAiCodeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#120c0b] rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-red-900/40 relative my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-red-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-red-950/50">
                  <Scan size={22} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-heading">
                      AI Code Analyzer & AI-Generated Code Detector
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-950/80 text-orange-300 border border-orange-500/30 uppercase tracking-wider">
                      Judges Tool
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Detect LLM synthetic signatures, analyze token burstiness, find security flaws, and calibrate rubric scores
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiCodeModal(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-[#1c1211] transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Target Project Selection & Quick Presets Bar */}
              <div className="p-3.5 bg-[#170e0d] rounded-2xl border border-red-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1">
                  <span className="text-xs font-semibold text-zinc-300 shrink-0 flex items-center gap-1">
                    <Layers size={14} className="text-orange-400" /> Target Submission:
                  </span>
                  <select
                    value={targetSubmissionId}
                    onChange={(e) => {
                      const sid = e.target.value;
                      setTargetSubmissionId(sid);
                      if (sid) {
                        const s = submissions.find(item => item.id === sid);
                        if (s) handleOpenCodeAnalyzer(s);
                      }
                    }}
                    className="w-full md:w-64 px-3 py-1.5 text-xs bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                  >
                    <option value="">-- Custom Code / File Input --</option>
                    {submissions.map(sub => (
                      <option key={sub.id} value={sub.id} className="bg-[#1c1211] text-zinc-100">
                        {sub.title} ({sub.teamName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preset Sample Quick Loaders */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0">
                    Test Samples:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('ai')}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 font-semibold text-[11px] transition shrink-0 cursor-pointer"
                  >
                    AI Generated Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('human')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] transition shrink-0 cursor-pointer"
                  >
                    Human Authored Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('vulnerable')}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition shrink-0 cursor-pointer"
                  >
                    Security Flaw Sample
                  </button>
                </div>
              </div>

              {/* Input Mode Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-red-950">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveAnalyzerTab('code')}
                    className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                      activeAnalyzerTab === 'code'
                        ? "border-orange-500 text-orange-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Code2 size={14} /> Code Editor / Paste
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAnalyzerTab('upload')}
                    className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                      activeAnalyzerTab === 'upload'
                        ? "border-orange-500 text-orange-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <UploadCloud size={14} /> Upload Code File
                  </button>
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <span className="text-[11px] text-zinc-400 font-medium">File:</span>
                  <input
                    type="text"
                    value={codeFilename}
                    onChange={(e) => setCodeFilename(e.target.value)}
                    className="px-2 py-1 text-xs bg-[#1c1211] border border-red-900/40 rounded-lg outline-none font-mono text-zinc-200 w-36 sm:w-48"
                  />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-2 py-1 text-xs bg-[#1c1211] border border-red-900/40 rounded-lg outline-none text-zinc-200 font-medium"
                  >
                    <option value="javascript" className="bg-[#1c1211] text-zinc-100">JavaScript / TypeScript</option>
                    <option value="python" className="bg-[#1c1211] text-zinc-100">Python</option>
                    <option value="java" className="bg-[#1c1211] text-zinc-100">Java</option>
                    <option value="cpp" className="bg-[#1c1211] text-zinc-100">C / C++ / C#</option>
                    <option value="html" className="bg-[#1c1211] text-zinc-100">HTML / CSS</option>
                  </select>
                </div>
              </div>

              {/* Tab 1: Code Editor Input */}
              {activeAnalyzerTab === 'code' && (
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border border-red-950 shadow-md">
                    <div className="bg-[#170e0d] text-zinc-400 px-4 py-2 text-xs flex items-center justify-between border-b border-red-950 font-mono">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-orange-400" />
                        <span className="text-zinc-200">{codeFilename}</span>
                      </div>
                      <span>{codeToAnalyze.split('\n').length} lines · {codeToAnalyze.length} chars</span>
                    </div>

                    <textarea
                      rows={10}
                      value={codeToAnalyze}
                      onChange={(e) => setCodeToAnalyze(e.target.value)}
                      placeholder="// Paste code snippet or project logic here to analyze..."
                      className="w-full p-4 bg-[#090707] text-zinc-100 font-mono text-xs sm:text-[13px] leading-relaxed outline-none resize-none selection:bg-orange-600 selection:text-white"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Upload Source File */}
              {activeAnalyzerTab === 'upload' && (
                <div className="p-8 border-2 border-dashed border-red-900/40 rounded-3xl bg-[#170e0d]/60 text-center space-y-3 hover:border-orange-500/50 transition">
                  <div className="w-12 h-12 rounded-2xl bg-[#1f1311] text-orange-400 flex items-center justify-center mx-auto shadow-xs border border-red-900/30">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Upload Project Code Deliverable</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Supports JavaScript (.js, .jsx), TypeScript (.ts, .tsx), Python (.py), Java (.java), C/C++ (.cpp), or HTML/CSS
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition">
                    <UploadCloud size={14} />
                    <span>Choose Source File</span>
                    <input
                      type="file"
                      accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.html,.css,.json,.sql"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Analyze Execution Trigger Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Brain size={14} className="text-orange-400" />
                  <span>AI scans token entropy, synthetic comment markers, code health & vulnerabilities</span>
                </div>

                <button
                  type="button"
                  onClick={handleRunCodeAnalysis}
                  disabled={analyzingCode || !codeToAnalyze.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {analyzingCode ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Scanning Code Signatures...</span>
                    </>
                  ) : (
                    <>
                      <Scan size={15} />
                      <span>Run AI Detection & Code Audit</span>
                    </>
                  )}
                </button>
              </div>

              {/* ANALYSIS RESULTS DASHBOARD */}
              {analysisResult && (
                <div className="mt-6 pt-6 border-t border-red-950 space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  {/* Top Verdict Banner */}
                  <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
                    analysisResult.aiDetection.riskLevel === 'HIGH'
                      ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                      : analysisResult.aiDetection.riskLevel === 'MODERATE'
                      ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                      : "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  }`}>
                    <div className="flex items-start gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        analysisResult.aiDetection.riskLevel === 'HIGH'
                          ? "bg-rose-600 text-white shadow-rose-950/50"
                          : analysisResult.aiDetection.riskLevel === 'MODERATE'
                          ? "bg-amber-600 text-white shadow-amber-950/50"
                          : "bg-emerald-600 text-white shadow-emerald-950/50"
                      }`}>
                        {analysisResult.aiDetection.riskLevel === 'HIGH' ? (
                          <Cpu size={24} />
                        ) : analysisResult.aiDetection.riskLevel === 'MODERATE' ? (
                          <Sparkles size={24} />
                        ) : (
                          <CheckCircle2 size={24} />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-extrabold text-base sm:text-lg text-white">
                            {analysisResult.aiDetection.verdict}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            analysisResult.aiDetection.riskLevel === 'HIGH'
                              ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                              : analysisResult.aiDetection.riskLevel === 'MODERATE'
                              ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                          }`}>
                            {analysisResult.aiDetection.probability}% AI Likelihood
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
                          {analysisResult.findingsSummary[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyReport}
                        className="px-3 py-1.5 bg-[#1c1211] hover:bg-red-950 text-zinc-200 border border-red-900/40 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedReport ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedReport ? "Report Copied" : "Copy Audit"}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Cards Grid: AI Signals, Code Quality, Security Audit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: AI Signature Metrics */}
                    <div className="p-4 bg-[#170e0d] rounded-2xl border border-red-950 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                        <span className="flex items-center gap-1.5 text-orange-400">
                          <Cpu size={15} /> AI Signature Signals
                        </span>
                        <span className="text-zinc-500 font-mono text-[11px]">
                          {analysisResult.aiDetection.syntheticSignaturesFound} Flagged
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
                            <span>AI Generation Probability</span>
                            <strong className="text-orange-400">{analysisResult.aiDetection.probability}%</strong>
                          </div>
                          <div className="w-full h-1.5 bg-[#090707] rounded-full overflow-hidden border border-red-950">
                            <div
                              className={`h-full ${
                                analysisResult.aiDetection.probability > 70
                                  ? "bg-rose-500"
                                  : analysisResult.aiDetection.probability > 40
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${analysisResult.aiDetection.probability}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-[11px] pt-1 border-t border-red-950">
                          <span className="text-zinc-400">Token Burstiness:</span>
                          <strong className="text-zinc-200">{analysisResult.aiDetection.burstinessScore}/100</strong>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Comment Density:</span>
                          <strong className="text-zinc-200">{analysisResult.aiDetection.commentRatio}%</strong>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Generic Identifiers:</span>
                          <strong className="text-zinc-200">{analysisResult.aiDetection.identifierDensity} per line</strong>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Code Quality & Complexity */}
                    <div className="p-4 bg-[#170e0d] rounded-2xl border border-red-950 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                        <span className="flex items-center gap-1.5 text-orange-400">
                          <Code2 size={15} /> Code Quality & Health
                        </span>
                        <span className="px-2 py-0.5 bg-orange-950/80 text-orange-300 border border-orange-500/30 rounded-md text-[10px] font-bold">
                          Grade {analysisResult.codeQuality.maintainabilityRating}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Maintainability Score:</span>
                          <strong className="text-orange-400 font-bold">{analysisResult.codeQuality.maintainabilityScore}/100</strong>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Total Lines Analyzed:</span>
                          <strong className="text-zinc-200 font-mono">{analysisResult.lineCount} Lines</strong>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Functions / Modules:</span>
                          <strong className="text-zinc-200">{analysisResult.codeQuality.functionCount} Function(s)</strong>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Complexity Index:</span>
                          <strong className="text-zinc-200">{analysisResult.codeQuality.complexityPerFunction} avg</strong>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Security & Secrets Audit */}
                    <div className="p-4 bg-[#170e0d] rounded-2xl border border-red-950 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <ShieldAlert size={15} /> Security & Secrets Audit
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          analysisResult.securityAudit.totalIssues === 0
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-950/80 text-rose-300 border border-rose-500/30"
                        }`}>
                          {analysisResult.securityAudit.totalIssues === 0 ? "Clean Pass" : `${analysisResult.securityAudit.totalIssues} Issue(s)`}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {analysisResult.securityAudit.totalIssues === 0 ? (
                          <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-emerald-300 text-[11px] font-medium flex items-center gap-2">
                            <Check size={14} className="text-emerald-400 shrink-0" />
                            <span>No exposed credentials or dangerous execution sinks detected.</span>
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {analysisResult.securityAudit.findings.map((f, i) => (
                              <div key={i} className="p-1.5 bg-rose-950/40 rounded-lg border border-rose-500/30 text-[11px] text-rose-300">
                                <strong>{f.title}</strong>: {f.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flagged Code Lines Inspector (If any synthetic or suspicious patterns found) */}
                  {analysisResult.aiDetection.flaggedLines && analysisResult.aiDetection.flaggedLines.length > 0 && (
                    <div className="p-4 bg-[#090707] rounded-2xl border border-red-950 space-y-2.5 text-zinc-200">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-red-950">
                        <span className="font-bold flex items-center gap-1.5 text-orange-400">
                          <Bug size={14} /> Flagged Synthetic Patterns & Signatures:
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {analysisResult.aiDetection.flaggedLines.length} Pattern(s) Located
                        </span>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-xs pr-1">
                        {analysisResult.aiDetection.flaggedLines.map((flag, idx) => (
                          <div key={idx} className="p-2 bg-[#170e0d] rounded-xl border border-red-950 flex items-start gap-2.5">
                            <span className="px-1.5 py-0.5 rounded-md bg-orange-950 text-orange-300 border border-orange-500/30 text-[10px] font-bold shrink-0">
                              Line {flag.line}
                            </span>
                            <div className="flex-1 overflow-hidden">
                              <code className="text-zinc-200 block truncate">{flag.content}</code>
                              <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                                Reason: {flag.reason}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Rubric Score & Transfer to Scoring Action Bar */}
                  <div className="p-4 bg-[#1e1311] border border-orange-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-orange-400" />
                        <h4 className="font-bold text-xs sm:text-sm text-white">
                          Calibrated Rubric Recommendation: {analysisResult.recommendedRubric.calibratedScore}/100
                        </h4>
                      </div>
                      <p className="text-[11px] text-orange-300/80 mt-0.5">
                        Technical Execution: {analysisResult.recommendedRubric.technicalExecution}/10 · Innovation: {analysisResult.recommendedRubric.innovation}/10 · Code Integrity: {100 - analysisResult.aiDetection.probability}%
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleApplyAiScoreToRubric}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/60 border border-orange-400/30 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sliders size={13} />
                        <span>Transfer to Scoring Rubric</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-red-950 flex items-center justify-between shrink-0 text-xs">
              <span className="text-zinc-500">
                HackFlow AI Code Inspector v2.4
              </span>
              <button
                type="button"
                onClick={() => setShowAiCodeModal(false)}
                className="px-4 py-2 bg-[#1c1211] hover:bg-red-950 text-zinc-300 border border-red-900/40 rounded-xl font-semibold transition cursor-pointer"
              >
                Close Tool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
