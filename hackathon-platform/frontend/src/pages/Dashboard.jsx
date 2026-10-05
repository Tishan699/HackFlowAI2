import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Trophy,
  FileText,
  UserCheck,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Building,
  AlertTriangle,
  Check,
  X,
  History,
  Globe,
  DollarSign,
  Layers,
  Award,
  Send,
  Mail,
  Phone,
  Flame
} from "lucide-react";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { hackathonService } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [organizerApps, setOrganizerApps] = useState([]);
  const [myOrganizerStatus, setMyOrganizerStatus] = useState({
    isOrganizer: false,
    isVerified: false,
    applications: []
  });
  const [activeAdminTab, setActiveAdminTab] = useState("changes");
  const [loading, setLoading] = useState(true);

  // Quick Hackathon creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("AI & Machine Learning");
  const [newDate, setNewDate] = useState("Nov 20 - Nov 22, 2026");
  const [newPrize, setNewPrize] = useState("$12,000");

  // Participant Organizer Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null);
  const [applyError, setApplyError] = useState("");
  const [applyForm, setApplyForm] = useState({
    organizationName: "",
    proposedEventTitle: "",
    eventCategory: "AI & Machine Learning",
    proposedDates: "Dec 10 - Dec 12, 2026",
    prizeBudget: "$10,000",
    website: "",
    officialEmail: user?.email || "",
    contactPhone: "",
    pastEvents: "",
    proposal: "",
    estimatedParticipants: 150
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(false);
    try {
      const [hList, tList, sList] = await Promise.all([
        hackathonService.getAll(),
        hackathonService.getTeams(),
        hackathonService.getSubmissions(),
      ]);
      setHackathons(hList);
      setTeams(tList);
      setSubmissions(sList);

      if (user) {
        const myStatus = await hackathonService.getMyOrganizerStatus();
        setMyOrganizerStatus(myStatus || { isOrganizer: false, isVerified: false, applications: [] });
      }

      if (user?.role === "admin" || user?.role === "organizer") {
        const [changes, apps] = await Promise.all([
          hackathonService.getPendingEventChanges(),
          hackathonService.getOrganizerApplications()
        ]);
        setPendingChanges(changes || []);
        setOrganizerApps(apps || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    }
  };

  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await hackathonService.create({
      title: newTitle,
      category: newCategory,
      date: newDate,
      prizePool: newPrize,
      description: "Exciting innovation challenge with cash prizes and global mentorship.",
      organizerId: user?.id || "u_organizer",
      organizerEmail: user?.email || "organizer@hackflow.dev",
      organizer: user?.organization || user?.name || "HackFlow Organizer"
    });

    setShowCreateModal(false);
    setNewTitle("");
    loadData();
  };

  const handleReviewChange = async (changeId, decision) => {
    try {
      await hackathonService.reviewEventChange(changeId, decision, `Reviewed by ${user?.name || "Admin"}`);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to process review.");
    }
  };

  const handleReviewOrganizerApp = async (appId, decision) => {
    try {
      await hackathonService.reviewOrganizerApplication(appId, decision, `Reviewed by ${user?.name || "Admin"}`);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to process organizer review.");
    }
  };

  const handleApplyOrganizer = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError("");
    setApplyResult(null);

    try {
      const res = await hackathonService.applyForOrganizer({
        ...applyForm,
        officialEmail: applyForm.officialEmail || user?.email
      });
      setApplyResult(res);
      await loadData();
    } catch (err) {
      setApplyError(err.message || "Failed to submit organizer application.");
    } finally {
      setApplying(false);
    }
  };

  const isOwner = (h) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Boolean(
      h.isOwner ||
      (h.organizerId && String(h.organizerId) === String(user.id)) ||
      (h.organizerEmail && h.organizerEmail.toLowerCase() === user.email?.toLowerCase()) ||
      (user.organization && h.organizer && h.organizer.toLowerCase().includes(user.organization.toLowerCase())) ||
      (user.name && h.organizer && h.organizer.toLowerCase().includes(user.name.toLowerCase()))
    );
  };

  const totalParticipants = (Array.isArray(hackathons) ? hackathons : []).reduce(
    (acc, curr) => acc + (Number(curr?.participants) || 0),
    0
  );

  const latestApplication =
    myOrganizerStatus?.applications && Array.isArray(myOrganizerStatus.applications) && myOrganizerStatus.applications.length > 0
      ? myOrganizerStatus.applications[myOrganizerStatus.applications.length - 1]
      : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1a0d0c] via-[#2a1210] to-[#1a0d0c] text-white p-6 sm:p-8 rounded-3xl border border-red-900/60 shadow-2xl shadow-black/60 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight bg-gradient-to-r from-white via-orange-100 to-red-300 bg-clip-text text-transparent">
            Welcome back, {user?.name || "Innovator"}!
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm mt-1 max-w-xl">
            Live hackathon battlefield overview. Monitor teams, audit AI code authenticity, and review verified deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          {user?.role === "organizer" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-red-950/60 transition transform hover:-translate-y-0.5 cursor-pointer border border-orange-400/30"
            >
              <Plus size={17} />
              <span>Create Hackathon</span>
            </button>
          )}

          <Link
            to="/submissions"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1f1311] hover:bg-[#2c1714] text-zinc-200 rounded-xl text-xs sm:text-sm font-bold border border-red-900/50 transition"
          >
            <FileText size={17} className="text-orange-400" />
            <span>Submissions</span>
          </Link>
        </div>
      </div>

      {/* Participant Organizer Application Live Status Banner */}
      {user?.role === "participant" && latestApplication && (
        <>
          {latestApplication.status === "PENDING" && (
            <div className="p-5 bg-gradient-to-r from-[#170e0d] via-[#221210] to-[#170e0d] border border-orange-900/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-black/40">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30 border border-orange-400/30">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-zinc-100 text-sm">
                      Organizer Application & Event Proposal Under Review
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                      Pending Admin Decision
                    </span>
                    {latestApplication.aiEvaluation?.score && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-950 text-orange-300 border border-red-800/60">
                        AI Pre-Score: {latestApplication.aiEvaluation.score}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Proposed Event: <strong className="text-zinc-200">{latestApplication.proposedEventTitle || "Hackathon Challenge"}</strong> ({latestApplication.organizationName}) · Submitted {latestApplication.createdAt ? `on ${new Date(latestApplication.createdAt).toLocaleDateString()}` : "recently"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setShowApplyModal(true);
                  }}
                  className="px-4 py-2 bg-[#1f1311] text-orange-400 hover:bg-red-950 border border-red-900/50 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  View Submitted Proposal
                </button>
              </div>
            </div>
          )}

          {latestApplication.status === "APPROVED" && (
            <div className="p-5 bg-gradient-to-r from-[#0d1810] via-[#122217] to-[#0d1810] border border-emerald-900/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-emerald-200 text-sm">
                      Organizer Application Verified & Approved
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Verified Host Status
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 mt-0.5">
                    Congratulations! Your organization <strong>{latestApplication.organizationName}</strong> is verified. You can now publish competitions and manage participants.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={16} /> Create Hackathon
              </button>
            </div>
          )}

          {latestApplication.status === "REJECTED" && (
            <div className="p-5 bg-gradient-to-r from-[#200e0d] via-[#2c1311] to-[#200e0d] border border-rose-900/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-rose-200 text-sm">
                      Organizer Application Needs Revision
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      Revision Requested
                    </span>
                  </div>
                  <p className="text-xs text-rose-300 mt-0.5">
                    {latestApplication.reviewNotes || "Please provide more details regarding your prize pool sponsorship, track curriculum, and event timeline."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowApplyModal(true);
                  setApplyResult(null);
                  setApplyError("");
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer"
              >
                Resubmit Revised Proposal
              </button>
            </div>
          )}
        </>
      )}

      {/* Participant Organizer Showcase Card (When no pending application) */}
      {user?.role === "participant" && (!latestApplication || latestApplication.status === "REJECTED") && (
        <div className="bg-gradient-to-r from-[#1a0d0c] via-[#2b1411] to-[#1a0d0c] rounded-3xl p-6 sm:p-8 text-white border border-red-900/60 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-orange-300 text-xs font-bold">
                <Sparkles size={14} className="text-orange-400" />
                <span>Host Verification Program</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
                Host Your Own Hackathon on HackFlow AI
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Ready to organize an innovation competition for your university, company, or developer community? Apply for verified organizer status to access AI project screening, team registration management, and automated certificate issuance.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check size={14} className="text-orange-400 shrink-0" />
                  <span>AI Judging Engine</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check size={14} className="text-orange-400 shrink-0" />
                  <span>Live Team Roster</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check size={14} className="text-orange-400 shrink-0" />
                  <span>Custom Tracks & Prizes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check size={14} className="text-orange-400 shrink-0" />
                  <span>Auto-Certificates</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => {
                  setShowApplyModal(true);
                  setApplyResult(null);
                  setApplyError("");
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 border border-orange-400/30"
              >
                <ShieldCheck size={18} />
                <span>Apply as an Organizer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Hackers & Builders"
          value={totalParticipants || "487"}
          icon={Users}
          iconBg="bg-red-950/60 text-orange-400 border border-red-800/40"
        />

        <StatCard
          title="Active Hackathons"
          value={hackathons.length ? `0${hackathons.length}` : "03"}
          icon={Trophy}
          iconBg="bg-orange-950/60 text-amber-300 border border-orange-800/40"
        />

        <StatCard
          title="Projects Submitted"
          value={submissions.length || "18"}
          icon={FileText}
          iconBg="bg-amber-950/60 text-orange-300 border border-amber-800/40"
        />

        <StatCard
          title="AI Judging Progress"
          value="84%"
          icon={UserCheck}
          iconBg="bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
        />
      </div>

      {/* Two Column Section: Recent Hackathons & Live Activity Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Hackathons */}
        <div className="lg:col-span-2 bg-[#120c0b] border border-red-950/60 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-red-950/50 flex items-center justify-between bg-[#170e0d]">
            <div>
              <h2 className="font-extrabold text-zinc-100 text-lg">Active & Upcoming Competitions</h2>
              <p className="text-xs text-zinc-400">Live competitions currently accepting registrations and teams</p>
            </div>

            <Link
              to="/hackathons"
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-red-950/40">
            {(Array.isArray(hackathons) ? hackathons : []).slice(0, 3).map((h) => (
              <div
                key={h.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1a1110] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-zinc-100 text-base">{h.title}</h3>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                      {h.status || "Active"}
                    </span>
                    {h.eventState && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        h.eventState === 'DRAFT' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        h.eventState === 'REGISTRATION_CLOSED' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                        h.eventState === 'ONGOING' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        h.eventState === 'COMPLETED' ? 'bg-zinc-800 text-zinc-300 border-zinc-700' :
                        'bg-orange-950 text-orange-300 border-orange-800'
                      }`}>
                        {h.eventState}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-orange-400" /> {h.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-red-400" /> {h.participants || 0} Participants
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner(h) ? (
                    <>
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/60">
                        Your Event
                      </span>
                      <Link
                        to={`/hackathons/${h.id}`}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl transition flex items-center gap-1 shadow-xs"
                      >
                        <Edit3 size={13} /> Edit
                      </Link>
                      <Link
                        to={`/hackathons/${h.id}`}
                        className="px-3 py-1.5 text-xs font-bold text-zinc-300 bg-[#1f1311] hover:bg-red-600 hover:text-white rounded-xl border border-red-900/40 transition flex items-center gap-1"
                      >
                        Manage <ExternalLink size={12} />
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={`/hackathons/${h.id}`}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-red-950/40"
                    >
                      View Details <ExternalLink size={13} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live AI Evaluation Activity Feed */}
        <div className="bg-[#120c0b] border border-red-950/60 rounded-2xl shadow-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-red-950/50">
              <h2 className="font-extrabold text-zinc-100 text-lg flex items-center gap-2">
                <Flame size={18} className="text-orange-500 animate-pulse" /> Live Activity Feed
              </h2>
              <span className="text-[11px] font-bold text-orange-400 bg-red-950/80 border border-red-800/60 px-2 py-0.5 rounded-full">
                Real-time
              </span>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-950/70 border border-red-800/50 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-zinc-200">AI Scored Project "MedVision AI"</p>
                  <p className="text-zinc-400 mt-0.5">Automated score: 92/100 (Code quality: 9.5)</p>
                  <span className="text-[10px] text-zinc-500 font-mono">12 minutes ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-950/70 border border-orange-800/50 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Users size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-zinc-200">Team "NeuralNinjas" Registered</p>
                  <p className="text-zinc-400 mt-0.5">3 members checked in via QR scanner</p>
                  <span className="text-[10px] text-zinc-500 font-mono">45 minutes ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/70 border border-emerald-800/50 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-zinc-200">Judge Dr. Elena completed review</p>
                  <p className="text-zinc-400 mt-0.5">Submitted rubric evaluation for Track 1</p>
                  <span className="text-[10px] text-zinc-500 font-mono">1 hour ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-950/70 border border-amber-800/50 text-orange-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-zinc-200">Mentorship Hour Announced</p>
                  <p className="text-zinc-400 mt-0.5">Siddharth Verma available for Cloud Q&A</p>
                  <span className="text-[10px] text-zinc-500 font-mono">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-red-950/50 mt-4">
            <Link
              to="/attendance"
              className="w-full py-2.5 px-4 bg-[#1c1110] hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border border-red-900/40"
            >
              Open QR Attendance Scanner
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Create Hackathon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#140c0b] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-red-900/60 relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white font-heading">
              Create New Hackathon
            </h3>
            <p className="text-xs text-zinc-400 mt-1 mb-6">
              Launch a new competition. Participants will be able to register immediately.
            </p>

            <form onSubmit={handleCreateHackathon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider mb-1.5">
                  Hackathon Title
                </label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. NextGen Web3 & AI Hackathon"
                  className="w-full px-4 py-2.5 text-sm bg-[#1c1211] text-zinc-100 border border-red-900/40 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-[#1c1211] text-zinc-100 border border-red-900/40 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  >
                    <option>AI & Machine Learning</option>
                    <option>Cloud & DevOps</option>
                    <option>Fintech & Blockchain</option>
                    <option>HealthTech</option>
                    <option>Open Innovation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider mb-1.5">
                    Prize Pool
                  </label>
                  <input
                    value={newPrize}
                    onChange={(e) => setNewPrize(e.target.value)}
                    placeholder="e.g. $10,000"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] text-zinc-100 border border-red-900/40 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider mb-1.5">
                  Event Dates
                </label>
                <input
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. Nov 20 - Nov 22, 2026"
                  className="w-full px-4 py-2.5 text-sm bg-[#1c1211] text-zinc-100 border border-red-900/40 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-red-950/60">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 cursor-pointer"
                >
                  Publish Hackathon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participant Organizer Application & Proposal Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#120c0b] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-red-950/80 border border-red-900/40 relative my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-red-950/80 sticky top-0 bg-[#120c0b] z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-red-950/50">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">
                    Organizer Application & Event Proposal
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Host competitions on HackFlow AI. Screened via automated AI evaluation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full bg-[#1c1211] hover:bg-red-950/60 border border-red-900/30 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* If application was just submitted, show result */}
            {applyResult ? (
              <div className="mt-6 space-y-4">
                <div className="p-5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Sparkles size={18} />
                    <span>Application & Proposal Submitted Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-300 mt-1">
                    {applyResult.message}
                  </p>
                </div>

                {applyResult.application?.aiEvaluation && (
                  <div className="p-5 bg-[#170e0d] border border-red-950 rounded-2xl text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-red-950 pb-2">
                      <span className="font-bold text-zinc-200 text-sm">AI Screening & Credibility Score</span>
                      <span className="font-extrabold text-orange-400 bg-orange-950/60 border border-orange-500/30 px-3 py-1 rounded-full text-sm">
                        {applyResult.application.aiEvaluation.score}/100
                      </span>
                    </div>
                    <div>
                      <strong className="text-zinc-300 block mb-0.5">Automated Pre-assessment:</strong>
                      <p className="text-zinc-400 leading-relaxed">
                        {applyResult.application.aiEvaluation.recommendation || applyResult.application.aiEvaluation.summary}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30 text-amber-300">
                      <span className="font-semibold block">Next Step:</span>
                      Platform Administrators will review your proposal details. Once approved, your account will be upgraded to verified organizer status automatically.
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setApplyResult(null);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-950/50 cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : latestApplication && latestApplication.status === "PENDING" && !applyError ? (
              /* If user has a pending application and is viewing proposal details */
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-[#1f1311] border border-orange-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-300 font-bold text-sm">
                    <Clock size={17} className="text-orange-400" />
                    <span>Your Proposal is Currently Under Review</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    Pending Admin Approval
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#170e0d] p-4 rounded-2xl border border-red-950">
                  <div>
                    <span className="text-zinc-500 block font-semibold">Organization / Entity</span>
                    <strong className="text-zinc-200 text-sm">{latestApplication.organizationName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-semibold">Proposed Event Title</span>
                    <strong className="text-zinc-200 text-sm">{latestApplication.proposedEventTitle || "Hackathon Challenge"}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-semibold">Category / Track</span>
                    <span className="text-zinc-300">{latestApplication.eventCategory || "AI & Machine Learning"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-semibold">Target Scale & Prize Budget</span>
                    <span className="text-zinc-300">{latestApplication.estimatedParticipants || 100} Hackers · {latestApplication.prizeBudget || "$10,000"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-semibold">Official Contact Email</span>
                    <span className="text-zinc-300">{latestApplication.officialEmail || latestApplication.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-semibold">Website</span>
                    <span className="text-zinc-300">{latestApplication.website || "None specified"}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-zinc-400 font-bold block">Submitted Hackathon Concept & Mission:</span>
                  <p className="p-3 bg-[#170e0d] border border-red-950 rounded-xl text-zinc-300 leading-relaxed">
                    {latestApplication.proposal}
                  </p>
                </div>

                {latestApplication.aiEvaluation?.score && (
                  <div className="p-3 bg-[#1e1311] border border-orange-500/20 rounded-xl text-xs space-y-1 text-zinc-300">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-orange-400"><Sparkles size={14} /> AI Credibility Pre-Score</span>
                      <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-2 py-0.5 rounded-md font-extrabold">{latestApplication.aiEvaluation.score}/100</span>
                    </div>
                    <p className="text-zinc-400">{latestApplication.aiEvaluation.recommendation}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-red-950">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-5 py-2.5 bg-[#1c1211] hover:bg-red-950/60 text-zinc-300 border border-red-900/40 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* New Organizer Proposal Form */
              <form onSubmit={handleApplyOrganizer} className="space-y-5 mt-4">
                {applyError && (
                  <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                    <span>{applyError}</span>
                  </div>
                )}

                {/* Section 1: Organization Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={14} /> 1. Organization & Contact Profile
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Organization / University / Entity Name *
                      </label>
                      <input
                        required
                        value={applyForm.organizationName}
                        onChange={e => setApplyForm({ ...applyForm, organizationName: e.target.value })}
                        placeholder="e.g. Developer Club or Tech Labs"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Official Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={applyForm.officialEmail}
                        onChange={e => setApplyForm({ ...applyForm, officialEmail: e.target.value })}
                        placeholder="organizer@university.edu"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Website / Portfolio URL
                      </label>
                      <input
                        value={applyForm.website}
                        onChange={e => setApplyForm({ ...applyForm, website: e.target.value })}
                        placeholder="https://yourgroup.org"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Phone / Discord / Telegram
                      </label>
                      <input
                        value={applyForm.contactPhone}
                        onChange={e => setApplyForm({ ...applyForm, contactPhone: e.target.value })}
                        placeholder="+1 555-0199 or @handle"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Hackathon Proposal */}
                <div className="space-y-3 pt-2 border-t border-red-950">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy size={14} /> 2. Proposed Hackathon Project Proposal
                  </h4>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Proposed Hackathon Title *
                    </label>
                    <input
                      required
                      value={applyForm.proposedEventTitle}
                      onChange={e => setApplyForm({ ...applyForm, proposedEventTitle: e.target.value })}
                      placeholder="e.g. Global AI Innovators Hackathon 2026"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Category / Track
                      </label>
                      <select
                        value={applyForm.eventCategory}
                        onChange={e => setApplyForm({ ...applyForm, eventCategory: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      >
                        <option className="bg-[#1c1211] text-zinc-100">AI & Machine Learning</option>
                        <option className="bg-[#1c1211] text-zinc-100">Cloud & DevOps</option>
                        <option className="bg-[#1c1211] text-zinc-100">Web3 & Blockchain</option>
                        <option className="bg-[#1c1211] text-zinc-100">Fintech & Cybersecurity</option>
                        <option className="bg-[#1c1211] text-zinc-100">HealthTech & Bio</option>
                        <option className="bg-[#1c1211] text-zinc-100">CleanTech & Sustainability</option>
                        <option className="bg-[#1c1211] text-zinc-100">Open Innovation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Prize Pool / Budget
                      </label>
                      <input
                        value={applyForm.prizeBudget}
                        onChange={e => setApplyForm({ ...applyForm, prizeBudget: e.target.value })}
                        placeholder="e.g. $10,000"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Est. Participants
                      </label>
                      <input
                        type="number"
                        min="20"
                        value={applyForm.estimatedParticipants}
                        onChange={e => setApplyForm({ ...applyForm, estimatedParticipants: e.target.value })}
                        placeholder="150"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Proposed Event Dates & Duration
                    </label>
                    <input
                      value={applyForm.proposedDates}
                      onChange={e => setApplyForm({ ...applyForm, proposedDates: e.target.value })}
                      placeholder="e.g. Dec 10 - Dec 12, 2026 (48 hours)"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                {/* Section 3: Concept & Experience */}
                <div className="space-y-3 pt-2 border-t border-red-950">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} /> 3. Event Concept & Prior Experience
                  </h4>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Prior Event Hosting Experience (Optional)
                    </label>
                    <input
                      value={applyForm.pastEvents}
                      onChange={e => setApplyForm({ ...applyForm, pastEvents: e.target.value })}
                      placeholder="e.g. Organized regional university hackathons or online meetups in 2025"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Hackathon Concept, Mission & Problem Statements *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={applyForm.proposal}
                      onChange={e => setApplyForm({ ...applyForm, proposal: e.target.value })}
                      placeholder="Describe the hackathon theme, target challenges, sponsor involvement, and judging criteria..."
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-950">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 text-xs sm:text-sm text-zinc-400 hover:text-white font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-red-950/60 border border-orange-400/30 transition cursor-pointer disabled:opacity-70 flex items-center gap-2"
                  >
                    <Send size={15} />
                    <span>{applying ? "Screening with AI Assistant..." : "Submit Organizer Application"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
