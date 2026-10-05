import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Award,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Share2,
  UserPlus,
  Shield,
  FileCode,
  Edit3,
  Lock,
  Building,
  Plus,
  Trash2,
  QrCode,
  Save,
  X,
  AlertCircle,
  History,
  AlertTriangle,
  RefreshCw,
  Check,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { hackathonService } from "../services/api";

export default function HackathonDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Edit Event Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [sensitiveNotice, setSensitiveNotice] = useState(null);

  // Change History & Lifecycle State Machine
  const [changeHistory, setChangeHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stateUpdating, setStateUpdating] = useState(false);
  const [stateMessage, setStateMessage] = useState("");

  useEffect(() => {
    loadHackathon();
    loadChangeHistory();
  }, [id, user]);

  const loadHackathon = async () => {
    try {
      const data = await hackathonService.getById(id);
      setHackathon(data);
      const teamList = await hackathonService.getTeams(id);
      setTeams(teamList);
    } catch (err) {
      console.error("Failed to load hackathon details:", err);
    }
  };

  const loadChangeHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await hackathonService.getEventChanges(id);
      setChangeHistory(history);
    } catch (err) {
      console.error("Failed to load event change history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Determine if the current authenticated user is the assigned organizer of THIS event
  const isEventOrganizer = Boolean(
    user && (
      user.role === "admin" ||
      (user.role === "organizer" && (
        hackathon?.isOwner === true ||
        (hackathon?.organizerId && String(hackathon.organizerId) === String(user.id)) ||
        (hackathon?.organizerEmail && hackathon.organizerEmail.toLowerCase() === user.email?.toLowerCase()) ||
        (user.organization && hackathon?.organizer && hackathon.organizer.toLowerCase().includes(user.organization.toLowerCase())) ||
        (user.name && hackathon?.organizer && hackathon.organizer.toLowerCase().includes(user.name.toLowerCase()))
      ))
    )
  );

  const isOtherOrganizer = user?.role === "organizer" && !isEventOrganizer;

  const handleOpenEdit = () => {
    setEditForm({
      title: hackathon.title || "",
      tagline: hackathon.tagline || "",
      description: hackathon.description || "",
      category: hackathon.category || "AI & Machine Learning",
      date: hackathon.date || "",
      startDate: hackathon.startDate || "",
      endDate: hackathon.endDate || "",
      prizePool: hackathon.prizePool || "$10,000",
      location: hackathon.location || "Hybrid",
      maxTeams: hackathon.maxTeams || 100,
      status: hackathon.status || "Upcoming",
      badge: hackathon.badge || "Registration Open",
      rules: Array.isArray(hackathon.rules) ? [...hackathon.rules] : [
        "Teams can have 2 to 4 members.",
        "All code must be authored during the competition period.",
        "Projects must include a working repository and video demo."
      ],
      prizes: Array.isArray(hackathon.prizes) ? [...hackathon.prizes] : [
        { place: "Grand Champion (1st Place)", reward: "$8,000 + Cloud Credits" },
        { place: "Runner Up (2nd Place)", reward: "$4,000 Cash" },
        { place: "Best Technical Innovation", reward: "$1,500 Special Award" }
      ]
    });
    setSaveError("");
    setSaveSuccess(false);
    setSensitiveNotice(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSensitiveNotice(null);

    try {
      const updated = await hackathonService.update(id, editForm);
      setHackathon(prev => ({ ...prev, ...updated }));
      
      if (updated.requiresApproval) {
        setSensitiveNotice({
          message: updated.message,
          pendingChanges: updated.pendingChanges || [],
          autoAppliedChanges: updated.autoAppliedChanges || []
        });
      } else {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setShowEditModal(false);
        }, 1200);
      }
      loadHackathon();
      loadChangeHistory();
    } catch (err) {
      console.error("Save error:", err);
      setSaveError(err.message || "Failed to update event details. Please verify your organizer permissions.");
    } finally {
      setSaving(false);
    }
  };

  const handleStateTransition = async (newState) => {
    setStateUpdating(true);
    setStateMessage("");
    try {
      const res = await hackathonService.updateEventState(id, newState);
      setHackathon(prev => ({
        ...prev,
        eventState: res.eventState,
        status: res.status,
        badge: res.badge
      }));
      setStateMessage(`Event successfully transitioned to ${newState}!`);
      setTimeout(() => setStateMessage(""), 4000);
      loadHackathon();
      loadChangeHistory();
    } catch (err) {
      setStateMessage(err.message || "Failed to transition event state.");
    } finally {
      setStateUpdating(false);
    }
  };

  const handleReviewChange = async (changeId, decision) => {
    try {
      await hackathonService.reviewEventChange(changeId, decision, `Reviewed by ${user?.name || "Platform Admin"}`);
      await loadHackathon();
      await loadChangeHistory();
    } catch (err) {
      alert(err.message || "Failed to process change request review.");
    }
  };

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!teamName) return;

    await hackathonService.createTeam({
      hackathonId: id,
      hackathonTitle: hackathon?.title,
      name: teamName,
      leader: leaderName || user?.name || "You",
      leaderEmail: user?.email || "leader@example.com",
      members: [{ name: leaderName || user?.name || "You", role: "Team Lead" }],
      projectTitle: "Pending Project Definition",
    });

    setRegisteredSuccess(true);
    setTimeout(() => {
      setShowRegisterModal(false);
      setRegisteredSuccess(false);
      setTeamName("");
      loadHackathon();
    }, 1200);
  };

  if (!hackathon) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">Loading competition details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button & Role Scoping Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/hackathons"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-orange-400 transition"
        >
          <ArrowLeft size={16} /> Back to all competitions
        </Link>

        {/* Ownership Status Badge */}
        {isEventOrganizer && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold">
            <Sparkles size={14} className="text-amber-400" />
            <span>You are the Organizer of this Event</span>
          </div>
        )}

        {isOtherOrganizer && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#170e0d] border border-red-950/80 text-zinc-400 text-xs font-medium">
            <Lock size={13} className="text-zinc-500" />
            <span>Organized by: <strong className="text-zinc-200">{hackathon.organizer}</strong> (Read-only access)</span>
          </div>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-[#170e0d] via-[#140c0b] to-[#1c1211] text-white rounded-3xl p-6 sm:p-10 border border-red-950/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950/80 text-orange-300 border border-red-900/50">
                {hackathon.category || "General Hackathon"}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                {hackathon.status || "Registration Open"}
              </span>

              {hackathon.eventState && (
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border backdrop-blur-md ${
                  hackathon.eventState === 'DRAFT'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    : hackathon.eventState === 'REGISTRATION_CLOSED'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                    : hackathon.eventState === 'ONGOING'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : hackathon.eventState === 'COMPLETED'
                    ? 'bg-zinc-900/80 text-zinc-300 border-zinc-700'
                    : 'bg-red-950/80 text-orange-300 border-orange-500/40'
                }`}>
                  State: {hackathon.eventState}
                </span>
              )}

              {hackathon.prizePool && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Award size={13} /> Prize Pool: {hackathon.prizePool}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight text-white">
              {hackathon.title}
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {hackathon.tagline || hackathon.description}
            </p>

            <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-orange-400" />
                <span>{hackathon.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-orange-400" />
                <span>{hackathon.participants || 0} Registered Innovators</span>
              </div>
              {hackathon.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-orange-400" />
                  <span>{hackathon.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Building size={16} className="text-orange-400" />
                <span>Organizer: <strong className="text-zinc-200">{hackathon.organizer || "Authorized Host"}</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* ONLY DISPLAY EDIT BUTTON IF CURRENT USER IS THE ORGANIZER OF THIS EVENT */}
            {isEventOrganizer && (
              <button
                onClick={handleOpenEdit}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-950/60 border border-amber-400/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Edit3 size={18} />
                <span>Edit Event Details</span>
              </button>
            )}

            {/* Standard Participant actions */}
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <UserPlus size={18} />
              <span>Register Your Team</span>
            </button>

            <Link
              to="/submissions"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#170e0d] hover:bg-[#1c1211] text-zinc-200 rounded-xl text-sm font-semibold border border-red-950/80 backdrop-blur-md transition"
            >
              <FileCode size={18} />
              <span>Submit Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Organizer Quick Management Bar & Lifecycle State Machine */}
      {isEventOrganizer && (
        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-950/60">
                <Shield size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Event Organizer Admin Panel</h4>
                <p className="text-xs text-zinc-400">
                  You have administrative authority to edit event details, manage lifecycle stages, and monitor registrations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleOpenEdit}
                className="px-3.5 py-2 text-xs font-bold bg-[#1c1211] text-orange-300 border border-red-900/40 hover:bg-red-950/60 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Edit3 size={14} /> Edit Event
              </button>
              <Link
                to="/attendance"
                className="px-3.5 py-2 text-xs font-bold bg-[#1c1211] text-zinc-300 border border-red-900/40 hover:bg-red-950/60 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <QrCode size={14} /> QR Check-in
              </Link>
              <Link
                to="/teams"
                className="px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-red-950/60"
              >
                <Users size={14} /> View Teams ({teams.length})
              </Link>
            </div>
          </div>

          {/* Event Lifecycle State Machine Controls */}
          <div className="pt-3 border-t border-red-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-400">Event Stage:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] ${
                hackathon.eventState === 'DRAFT' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' :
                hackathon.eventState === 'REGISTRATION_CLOSED' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' :
                hackathon.eventState === 'ONGOING' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' :
                hackathon.eventState === 'COMPLETED' ? 'bg-zinc-900 text-zinc-300 border border-zinc-700' :
                'bg-red-950/80 text-orange-300 border border-orange-500/40'
              }`}>
                {hackathon.eventState || 'PUBLISHED'}
              </span>
              {stateMessage && (
                <span className="text-emerald-400 font-semibold italic ml-2">
                  {stateMessage}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {hackathon.eventState === 'DRAFT' && (
                <button
                  onClick={() => handleStateTransition('PUBLISHED')}
                  disabled={stateUpdating}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  Publish Event (Open Registrations)
                </button>
              )}

              {(hackathon.eventState === 'PUBLISHED' || !hackathon.eventState) && (
                <>
                  <button
                    onClick={() => handleStateTransition('REGISTRATION_CLOSED')}
                    disabled={stateUpdating}
                    className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 rounded-xl font-bold transition cursor-pointer"
                  >
                    Close Registrations
                  </button>
                  <button
                    onClick={() => handleStateTransition('ONGOING')}
                    disabled={stateUpdating}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                  >
                    Start Live Event
                  </button>
                </>
              )}

              {hackathon.eventState === 'REGISTRATION_CLOSED' && (
                <>
                  <button
                    onClick={() => handleStateTransition('PUBLISHED')}
                    disabled={stateUpdating}
                    className="px-3 py-1.5 bg-[#1c1211] hover:bg-red-950/60 text-zinc-300 border border-red-900/40 rounded-xl font-semibold transition cursor-pointer"
                  >
                    Re-open Registrations
                  </button>
                  <button
                    onClick={() => handleStateTransition('ONGOING')}
                    disabled={stateUpdating}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                  >
                    Start Live Event
                  </button>
                </>
              )}

              {hackathon.eventState === 'ONGOING' && (
                <button
                  onClick={() => handleStateTransition('COMPLETED')}
                  disabled={stateUpdating}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  Conclude Event
                </button>
              )}

              {hackathon.eventState === 'COMPLETED' && (
                <span className="text-zinc-500 font-medium italic">
                  Archived / Concluded (Locked)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-red-950/80 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Overview & Rules" },
          { id: "timeline", label: "Timeline & Milestones" },
          { id: "prizes", label: "Prizes & Grants" },
          { id: "teams", label: `Teams (${teams.length})` },
          { id: "rubrics", label: "AI Evaluation Criteria" },
          { id: "history", label: `Audit & Change History (${changeHistory.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold transition border-b-2 -mb-px whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-orange-500 text-amber-300"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#120c0b] border border-red-950/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white">About the Hackathon</h2>
                {isEventOrganizer && (
                  <button
                    onClick={handleOpenEdit}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <Edit3 size={13} /> Edit Description
                  </button>
                )}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {hackathon.description}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield size={18} className="text-orange-500" /> Participation Guidelines & Rules
                </h3>
                {isEventOrganizer && (
                  <button
                    onClick={handleOpenEdit}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <Edit3 size={13} /> Modify Rules
                  </button>
                )}
              </div>
              <ul className="space-y-2.5 text-sm text-zinc-300">
                {(hackathon.rules || [
                  "Teams of 2 to 4 members are eligible.",
                  "All code must be authored during the competition period.",
                  "Open-source libraries and generative AI tools are permitted with citation."
                ]).map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-red-950/60">
              <h3 className="text-base font-bold text-white">
                Event Details
              </h3>
              {isEventOrganizer && (
                <button
                  onClick={handleOpenEdit}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block font-medium">Assigned Organizer</span>
                <span className="text-zinc-200 font-bold">{hackathon.organizer || "Authorized Host"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-medium">Format & Location</span>
                <span className="text-zinc-200 font-bold">{hackathon.location || "Hybrid"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-medium">Maximum Teams</span>
                <span className="text-zinc-200 font-bold">{hackathon.maxTeams || "100"} Teams</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-medium">Category</span>
                <span className="text-zinc-200 font-bold">{hackathon.category || "General"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-medium">AI Judging Engine</span>
                <span className="text-emerald-400 font-bold">Enabled (Autonomous Rubric Pass)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-red-950/60 space-y-2">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition cursor-pointer"
              >
                Register Team
              </button>
              {isEventOrganizer && (
                <button
                  onClick={handleOpenEdit}
                  className="w-full py-2.5 bg-[#1c1211] hover:bg-red-950/60 text-zinc-300 rounded-xl text-xs font-bold border border-red-900/40 transition cursor-pointer"
                >
                  Edit Competition Settings
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Timeline */}
      {activeTab === "timeline" && (
        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Competition Milestones</h2>
            {isEventOrganizer && (
              <button
                onClick={handleOpenEdit}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <Edit3 size={13} /> Update Schedule
              </button>
            )}
          </div>
          <div className="space-y-6 max-w-2xl">
            {(hackathon.timeline || [
              { step: "Kickoff & Registration", date: "Day 1, 9:00 AM", done: true },
              { step: "Mentorship Session", date: "Day 2, 2:00 PM", done: false },
              { step: "Project Submissions Close", date: "Day 3, 12:00 PM", done: false },
              { step: "Awards Ceremony", date: "Day 3, 5:00 PM", done: false },
            ]).map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  item.done ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40" : "bg-red-950/60 text-orange-400 border border-red-900/40"
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.step}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Prizes */}
      {activeTab === "prizes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Prizes & Bounties Pool</h2>
            {isEventOrganizer && (
              <button
                onClick={handleOpenEdit}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <Edit3 size={13} /> Adjust Prize Pool
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(hackathon.prizes || [
              { place: "Grand Champion", reward: "$7,500 Cash + Cloud Credits" },
              { place: "Runner Up", reward: "$4,000 Cash + Fast-Track Incubation" },
              { place: "Best Technical Innovation", reward: "$2,000 Special Category" },
            ]).map((prize, idx) => (
              <div
                key={idx}
                className="bg-[#120c0b] border border-red-950/80 hover:border-orange-500/40 rounded-2xl p-6 text-center hover:shadow-2xl transition"
              >
                <div className="w-12 h-12 bg-red-950/80 border border-orange-500/40 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award size={24} />
                </div>
                <h3 className="font-bold text-base text-white">{prize.place}</h3>
                <p className="text-xs text-amber-300 font-bold mt-2">{prize.reward}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Teams */}
      {activeTab === "teams" && (
        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Registered Teams</h2>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/60 border border-orange-400/30 transition cursor-pointer"
            >
              Join / Create Team
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-zinc-500 text-sm">
                No teams registered yet. Be the first to register!
              </div>
            ) : (
              teams.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-red-950/60 bg-[#170e0d]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{t.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      t.checkedIn ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40" : "bg-[#1c1211] text-zinc-400 border border-red-950/60"
                    }`}>
                      {t.checkedIn ? "Checked In" : "Pending Check-in"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Lead: <strong className="text-zinc-200">{t.leader}</strong></p>
                  <div className="mt-3 text-xs text-zinc-500">
                    {t.members?.length || 1} team members
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: AI Rubrics */}
      {activeTab === "rubrics" && (
        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-white">AI Assisted Evaluation Rubrics</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Our AI evaluation pipeline analyzes project repositories and demo deliverables against the following 4 dimensions:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-red-950/60 bg-[#170e0d]">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">30% Weight</span>
              <h4 className="font-bold text-sm text-white mt-1">Innovation & Originality</h4>
              <p className="text-xs text-zinc-400 mt-1">Novelty of problem solution, AI model adaptation, and creative edge.</p>
            </div>
            <div className="p-4 rounded-xl border border-red-950/60 bg-[#170e0d]">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">30% Weight</span>
              <h4 className="font-bold text-sm text-white mt-1">Technical Architecture</h4>
              <p className="text-xs text-zinc-400 mt-1">Code structure, unit tests, API integration, and clean cloud deployment.</p>
            </div>
            <div className="p-4 rounded-xl border border-red-950/60 bg-[#170e0d]">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">20% Weight</span>
              <h4 className="font-bold text-sm text-white mt-1">User Experience & UI Design</h4>
              <p className="text-xs text-zinc-400 mt-1">Intuitive flow, responsiveness, aesthetic finish, and accessibility.</p>
            </div>
            <div className="p-4 rounded-xl border border-red-950/60 bg-[#170e0d]">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">20% Weight</span>
              <h4 className="font-bold text-sm text-white mt-1">Feasibility & Real-world Impact</h4>
              <p className="text-xs text-zinc-400 mt-1">Viability for adoption, scalability, and measurable user benefit.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit & Change History */}
      {activeTab === "history" && (
        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-950/60">
            <div>
              <div className="flex items-center gap-2">
                <History size={20} className="text-orange-500" />
                <h2 className="text-lg font-bold text-white">Event Audit & Change History</h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full chronological audit trail of operational edits and sensitive parameter approvals with AI risk evaluations.
              </p>
            </div>
            <button
              onClick={loadChangeHistory}
              disabled={loadingHistory}
              className="px-3.5 py-1.5 bg-[#1c1211] hover:bg-red-950/60 text-zinc-200 border border-red-900/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw size={13} className={loadingHistory ? "animate-spin" : ""} />
              <span>Refresh Audit Log</span>
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-400">Loading audit history...</p>
            </div>
          ) : changeHistory.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No modification logs recorded for this event yet. Parameter changes and lifecycle transitions will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {changeHistory.map((change) => {
                const isPending = change.status === "PENDING_APPROVAL";
                const isApproved = change.status === "APPROVED";
                const isAuto = change.status === "AUTO_APPLIED";
                const isRejected = change.status === "REJECTED";
                const aiRisk = change.aiAnalysis?.riskLevel;

                return (
                  <div
                    key={change.id}
                    className={`p-5 rounded-2xl border transition ${
                      isPending
                        ? "bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30"
                        : isApproved
                        ? "bg-emerald-950/30 border-emerald-500/40"
                        : isRejected
                        ? "bg-rose-950/30 border-rose-500/40"
                        : "bg-[#170e0d] border-red-950/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-red-950/60">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white capitalize">
                          Parameter: <code className="bg-[#1c1211] px-2 py-0.5 rounded text-orange-400 font-mono text-xs border border-red-900/40">{change.field}</code>
                        </span>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isPending
                              ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                              : isApproved
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                              : isRejected
                              ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                              : "bg-red-950/80 text-orange-300 border border-red-900/40"
                          }`}
                        >
                          {isPending ? "Pending Admin Approval" : isApproved ? "Approved" : isRejected ? "Rejected" : "Auto Applied"}
                        </span>

                        {aiRisk && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              aiRisk === "HIGH"
                                ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                                : aiRisk === "MEDIUM"
                                ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                                : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                            }`}
                          >
                            AI Risk: {aiRisk}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-zinc-500">
                        {change.changedAt ? new Date(change.changedAt).toLocaleString() : "Recently"}
                      </span>
                    </div>

                    {/* Diff View */}
                    <div className="grid sm:grid-cols-2 gap-3 my-3 text-xs">
                      <div className="p-3 bg-[#120c0b] rounded-xl border border-red-950/60">
                        <span className="font-bold text-rose-400 block mb-1">Previous Value:</span>
                        <div className="text-zinc-300 font-mono text-xs break-words bg-rose-950/30 border border-rose-900/40 p-2 rounded-lg">
                          {typeof change.beforeValue === "object" ? JSON.stringify(change.beforeValue, null, 2) : String(change.beforeValue || "(empty)")}
                        </div>
                      </div>

                      <div className="p-3 bg-[#120c0b] rounded-xl border border-red-950/60">
                        <span className="font-bold text-emerald-400 block mb-1">Proposed / New Value:</span>
                        <div className="text-zinc-300 font-mono text-xs break-words bg-emerald-950/30 border border-emerald-900/40 p-2 rounded-lg">
                          {typeof change.afterValue === "object" ? JSON.stringify(change.afterValue, null, 2) : String(change.afterValue || "(empty)")}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400">
                      <strong>Submitted by:</strong> <span className="text-zinc-200">{change.organizerName || "Organizer"}</span>
                      {change.reason && <span className="ml-2 italic text-zinc-500">— "{change.reason}"</span>}
                    </div>

                    {/* AI Risk Analysis Details */}
                    {change.aiAnalysis && (
                      <div className="mt-3 p-3.5 bg-[#1c1211] border border-red-900/50 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-orange-400">
                          <Sparkles size={14} className="text-orange-400" />
                          <span>AI Impact Evaluation</span>
                        </div>
                        <p className="text-zinc-300">
                          <strong className="text-white">Participant Impact:</strong> {change.aiAnalysis.impactSummary}
                        </p>
                        <p className="text-zinc-400">
                          <strong className="text-zinc-300">Recommendation:</strong> {change.aiAnalysis.recommendation}
                        </p>
                      </div>
                    )}

                    {/* Platform Admin Action Bar */}
                    {user?.role === "admin" && isPending && (
                      <div className="mt-4 pt-3 border-t border-red-950/60 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-zinc-300">
                          Platform Admin Authority:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReviewChange(change.id, "REJECTED")}
                            className="px-3.5 py-1.5 bg-[#1c1211] hover:bg-rose-950/60 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Reject Request
                          </button>
                          <button
                            onClick={() => handleReviewChange(change.id, "APPROVED")}
                            className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1"
                          >
                            <Check size={14} /> Approve & Commit Change
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* EDIT EVENT DETAILS MODAL (ORGANIZER EXCLUSIVE)                        */}
      {/* ==================================================================== */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#120c0b] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-red-900/60 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-red-950/60">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 size={14} /> Organizer Administration
                </span>
                <h3 className="text-xl font-extrabold text-white font-heading mt-0.5">
                  Edit Event Details
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-[#1c1211] hover:bg-red-950/60 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {saveSuccess && (
              <div className="my-4 p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm font-semibold">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <span>Event details have been updated and saved successfully!</span>
              </div>
            )}

            {sensitiveNotice && (
              <div className="my-4 p-4 bg-amber-950/60 border border-amber-500/40 rounded-2xl text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                  <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                  <span>Sensitive Changes Staged for Admin Review</span>
                </div>
                <p className="leading-relaxed text-zinc-300">
                  {sensitiveNotice.message}
                </p>
                {sensitiveNotice.pendingChanges?.length > 0 && (
                  <div className="bg-[#170e0d] p-3 rounded-xl border border-amber-500/30 space-y-1">
                    <p className="font-bold text-white">Pending Approvals:</p>
                    {sensitiveNotice.pendingChanges.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-zinc-300">
                        <span className="capitalize">{p.field}:</span>
                        <span>{String(p.beforeValue)} <span className="text-zinc-500">&rarr;</span> <strong className="text-amber-300">{String(p.afterValue)}</strong></span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setActiveTab("history");
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    View in Audit History Tab
                  </button>
                </div>
              </div>
            )}

            {saveError && (
              <div className="my-4 p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-sm font-semibold">
                <AlertCircle size={20} className="text-rose-400 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Active Participant Protection Warning Banner */}
            {hackathon.participants > 0 && hackathon.eventState !== "DRAFT" && (
              <div className="my-3 p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Active Participant Protection Enabled ({hackathon.participants} registered)</p>
                  <p className="text-zinc-300 mt-0.5 leading-relaxed">
                    General descriptions and rules apply immediately. Changes to sensitive parameters (<strong>Prize Pool</strong>, <strong>Start Date</strong>, <strong>Max Teams</strong>) trigger an automated AI Risk Assessment and require Platform Admin approval to protect registered builders.
                  </p>
                </div>
              </div>
            )}

            {/* Sub-tab selection */}
            <div className="flex gap-2 border-b border-red-950/60 my-4 text-xs font-bold">
              {[
                { id: "basic", label: "General Information" },
                { id: "schedule", label: "Schedule & Prize Pool" },
                { id: "rules", label: `Rules (${editForm.rules.length})` }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditTab(t.id)}
                  className={`pb-2.5 px-3 border-b-2 cursor-pointer transition ${
                    editTab === t.id
                      ? "border-orange-500 text-amber-300 font-bold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Tab 1: Basic Information */}
              {editTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Event Title *
                    </label>
                    <input
                      required
                      value={editForm.title}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="e.g. AI Innovation Challenge 2026"
                      className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Tagline / Brief Punchline
                    </label>
                    <input
                      value={editForm.tagline}
                      onChange={e => setEditForm({ ...editForm, tagline: e.target.value })}
                      placeholder="e.g. Build cutting-edge autonomous agents"
                      className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Category
                      </label>
                      <select
                        value={editForm.category}
                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="AI & Machine Learning" className="bg-[#1c1211]">AI & Machine Learning</option>
                        <option value="AI & Cloud" className="bg-[#1c1211]">AI & Cloud</option>
                        <option value="Artificial Intelligence" className="bg-[#1c1211]">Artificial Intelligence</option>
                        <option value="Cloud & DevOps" className="bg-[#1c1211]">Cloud & DevOps</option>
                        <option value="Web3 & Blockchain" className="bg-[#1c1211]">Web3 & Blockchain</option>
                        <option value="Healthcare & BioTech" className="bg-[#1c1211]">Healthcare & BioTech</option>
                        <option value="Fintech & Open Finance" className="bg-[#1c1211]">Fintech & Open Finance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Competition Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="Active" className="bg-[#1c1211]">Active</option>
                        <option value="Upcoming" className="bg-[#1c1211]">Upcoming</option>
                        <option value="Registration Open" className="bg-[#1c1211]">Registration Open</option>
                        <option value="Live Judging" className="bg-[#1c1211]">Live Judging</option>
                        <option value="Concluded" className="bg-[#1c1211]">Concluded</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Full Event Description
                    </label>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Detailed event mission, challenges, and requirements..."
                      className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Schedule & Format */}
              {editTab === "schedule" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Display Date String
                      </label>
                      <input
                        value={editForm.date}
                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                        placeholder="e.g. Oct 15 - Oct 17, 2026"
                        className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Total Prize Pool
                        </label>
                        {hackathon.participants > 0 && hackathon.eventState !== "DRAFT" && (
                          <span className="text-[10px] text-amber-300 bg-amber-950/80 font-bold px-1.5 py-0.5 rounded border border-amber-500/40">
                            Staged for Admin Approval
                          </span>
                        )}
                      </div>
                      <input
                        value={editForm.prizePool}
                        onChange={e => setEditForm({ ...editForm, prizePool: e.target.value })}
                        placeholder="e.g. $15,000"
                        className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Format / Location
                      </label>
                      <input
                        value={editForm.location}
                        onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="e.g. Colombo / Hybrid or Virtual"
                        className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Max Teams Capacity
                        </label>
                        {hackathon.participants > 0 && hackathon.eventState !== "DRAFT" && (
                          <span className="text-[10px] text-amber-300 bg-amber-950/80 font-bold px-1.5 py-0.5 rounded border border-amber-500/40">
                            Protected Field
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        value={editForm.maxTeams}
                        onChange={e => setEditForm({ ...editForm, maxTeams: Number(e.target.value) })}
                        placeholder="100"
                        className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Rules & Guidelines */}
              {editTab === "rules" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-400">
                      Configure official competition rules for registered participants:
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditForm({
                        ...editForm,
                        rules: [...editForm.rules, "New competition guideline or rule."]
                      })}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> Add Rule
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {editForm.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          value={rule}
                          onChange={e => {
                            const updated = [...editForm.rules];
                            updated[idx] = e.target.value;
                            setEditForm({ ...editForm, rules: updated });
                          }}
                          className="flex-1 px-3 py-2 text-xs bg-[#1c1211] border border-red-900/40 text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editForm.rules.filter((_, i) => i !== idx);
                            setEditForm({ ...editForm, rules: updated });
                          }}
                          className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-900/40 text-red-400 hover:bg-red-900/60 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-red-950/60">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Event...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Team Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#120c0b] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-900/60 relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-white font-heading">
              Register Team for {hackathon.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 mb-5">
              Enter your team information to officially sign up.
            </p>

            {registeredSuccess ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-300 text-sm">Team Successfully Registered!</h4>
                <p className="text-xs text-emerald-400/80 mt-1">Redirecting to team dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Team Name *
                  </label>
                  <input
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. CyberVanguard"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Team Leader Name
                  </label>
                  <input
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-red-950/60">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30"
                  >
                    Confirm Registration
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
