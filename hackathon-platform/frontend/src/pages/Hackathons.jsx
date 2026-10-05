import { useState, useEffect } from "react";
import { Plus, Search, Filter, Sparkles, X, Building, ShieldCheck } from "lucide-react";
import HackathonCard from "../components/HackathonCard";
import { useAuth } from "../context/AuthContext";
import { hackathonService } from "../services/api";

export default function Hackathons() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [organizerScope, setOrganizerScope] = useState("all"); // 'all' or 'mine'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [targetState, setTargetState] = useState("PUBLISHED");
  const [formData, setFormData] = useState({
    title: "",
    category: "AI & Machine Learning",
    prizePool: "$10,000",
    date: "Nov 15 - Nov 17, 2026",
    startDate: "2026-11-15",
    endDate: "2026-11-17",
    registrationDeadline: "2026-11-10",
    entryFee: "Free",
    maxTeams: 100,
    location: "Virtual & Hybrid",
    tagline: "Build the future of technology with AI",
    description: "Join international builders for an intense weekend sprint.",
  });

  // Organizer Verification Modal State (Participant workflow)
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null);
  const [applyError, setApplyError] = useState("");
  const [applyForm, setApplyForm] = useState({
    organizationName: "",
    website: "",
    officialEmail: user?.email || "",
    contactPhone: "",
    pastEvents: "",
    proposal: "",
    estimatedParticipants: 100
  });

  useEffect(() => {
    loadHackathons();
  }, [user]);

  const loadHackathons = async () => {
    setLoading(true);
    try {
      const data = await hackathonService.getAll();
      setHackathons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    await hackathonService.create({
      ...formData,
      eventState: targetState,
      status: targetState === "DRAFT" ? "Draft" : "Active",
      badge: targetState === "DRAFT" ? "Draft Mode" : "Registration Open",
      organizerId: user?.id || "u_organizer",
      organizerEmail: user?.email || "organizer@hackflow.dev",
      organizer: user?.organization || user?.name || "HackFlow Organizer"
    });

    setShowModal(false);
    setFormData({
      title: "",
      category: "AI & Machine Learning",
      prizePool: "$10,000",
      date: "Nov 15 - Nov 17, 2026",
      startDate: "2026-11-15",
      endDate: "2026-11-17",
      registrationDeadline: "2026-11-10",
      entryFee: "Free",
      maxTeams: 100,
      location: "Virtual & Hybrid",
      tagline: "Build the future of technology with AI",
      description: "Join international builders for an intense weekend sprint.",
    });
    loadHackathons();
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
    } catch (err) {
      setApplyError(err.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const isEventOwner = (h) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return Boolean(
      h.isOwner ||
      (h.organizerId && String(h.organizerId) === String(user.id)) ||
      (h.organizerEmail && h.organizerEmail.toLowerCase() === user.email?.toLowerCase()) ||
      (user.organization && h.organizer && h.organizer.toLowerCase().includes(user.organization.toLowerCase())) ||
      (user.name && h.organizer && h.organizer.toLowerCase().includes(user.name.toLowerCase()))
    );
  };

  const myEventsCount = hackathons.filter(isEventOwner).length;

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      h.title?.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase()) ||
      h.category?.toLowerCase().includes(search.toLowerCase()) ||
      h.organizer?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Active" && (h.status?.toLowerCase() === "active" || h.eventState === "ONGOING" || h.eventState === "REGISTRATION_OPEN")) ||
      (selectedStatus === "Upcoming" && (h.status?.toLowerCase() === "upcoming" || h.eventState === "PUBLISHED")) ||
      (selectedStatus === "Drafts" && (h.eventState === "DRAFT" || h.status?.toLowerCase() === "draft")) ||
      (selectedStatus === "Concluded" && (h.eventState === "COMPLETED" || h.status?.toLowerCase() === "concluded" || h.status?.toLowerCase() === "ended"));

    const matchesCategory =
      selectedCategory === "All" ||
      h.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesScope =
      organizerScope === "all" || isEventOwner(h);

    return matchesSearch && matchesStatus && matchesCategory && matchesScope;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Hackathons & Competitions
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Discover cutting-edge hackathons, compete with top teams, and win prizes.
          </p>
        </div>

        {user?.role === "organizer" && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={18} />
            Create Hackathon
          </button>
        )}
      </div>

      {/* Organizer Scope Tabs */}
      {user?.role === "organizer" && (
        <div className="flex items-center gap-3 bg-[#170e0d] border border-red-950 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setOrganizerScope("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              organizerScope === "all"
                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All Competitions ({hackathons.length})
          </button>
          <button
            onClick={() => setOrganizerScope("mine")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              organizerScope === "mine"
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-950/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            My Organized Events ({myEventsCount})
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, organizer, technology, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["All", "Active", "Upcoming", ...(user?.role === "organizer" || user?.role === "admin" ? ["Drafts"] : []), "Concluded"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedStatus === status
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/50 border border-orange-400/20"
                  : "bg-[#1c1211] text-zinc-400 hover:text-white hover:bg-red-950/60 border border-red-900/30"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Participant Host Application Banner */}
      {user?.role === "participant" && (
        <div className="bg-[#170e0d] border border-orange-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-950/50">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Want to organize your own Hackathon?</h4>
              <p className="text-xs text-zinc-400">
                Apply for Verified Organizer credentials to host official competitions, configure rules, and coordinate AI evaluations.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowApplyModal(true); setApplyResult(null); setApplyError(""); }}
            className="px-4 py-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-950/50 border border-orange-400/30 whitespace-nowrap cursor-pointer shrink-0"
          >
            Apply for Host Verification
          </button>
        </div>
      )}

      {/* Grid of Hackathons */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Loading competitions...</p>
        </div>
      ) : filteredHackathons.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
      ) : (
        <div className="bg-[#120c0b] border border-red-950/80 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xl">
          <div className="w-12 h-12 bg-[#1f1311] text-orange-400 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Filter size={24} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {organizerScope === "mine" ? "No Events Organized by You Yet" : "No Hackathons Found"}
          </h3>
          <p className="text-zinc-400 text-xs mb-6">
            {organizerScope === "mine"
              ? "Create your first competition to manage registration, attendance, and AI judging."
              : "Try adjusting your search criteria or filter to discover competitions."}
          </p>
          {user?.role === "organizer" && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-xs font-semibold hover:from-red-500 hover:to-orange-500 transition cursor-pointer shadow-md shadow-red-950/50"
            >
              Create New Event
            </button>
          )}
        </div>
      )}

      {/* Create Hackathon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#120c0b] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-red-900/40 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-red-950">
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Create a New Hackathon
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Host an innovative competition under your organization.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#1c1211] hover:bg-red-950 text-zinc-400 hover:text-white border border-red-900/30 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Hackathon Title *
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. NextGen Web3 Sprint"
                  className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Short Tagline
                </label>
                <input
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  placeholder="e.g. Build the future of decentralized computing"
                  className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  >
                    <option className="bg-[#1c1211] text-zinc-100" value="AI & Machine Learning">AI & Machine Learning</option>
                    <option className="bg-[#1c1211] text-zinc-100" value="AI & Cloud">AI & Cloud</option>
                    <option className="bg-[#1c1211] text-zinc-100" value="Cloud & DevOps">Cloud & DevOps</option>
                    <option className="bg-[#1c1211] text-zinc-100" value="Web3 & Blockchain">Web3 & Blockchain</option>
                    <option className="bg-[#1c1211] text-zinc-100" value="HealthTech & Bio">HealthTech & Bio</option>
                    <option className="bg-[#1c1211] text-zinc-100" value="Fintech">Fintech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Prize Pool
                  </label>
                  <input
                    value={formData.prizePool}
                    onChange={(e) =>
                      setFormData({ ...formData, prizePool: e.target.value })
                    }
                    placeholder="e.g. $10,000"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Display Date
                  </label>
                  <input
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    placeholder="e.g. Nov 15 - Nov 17, 2026"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Format / Location
                  </label>
                  <input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Hybrid / Colombo"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationDeadline: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Max Teams Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.maxTeams}
                    onChange={(e) =>
                      setFormData({ ...formData, maxTeams: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detail the challenge requirements..."
                  className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-red-950 gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    onClick={() => setTargetState("DRAFT")}
                    className="px-4 py-2.5 bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    onClick={() => setTargetState("PUBLISHED")}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition cursor-pointer"
                  >
                    Publish Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organizer Application Modal (Participant -> Verified Organizer) */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#120c0b] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-red-900/40 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-red-950">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 text-white flex items-center justify-center shadow-md shadow-red-950/50">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">
                    Apply for Organizer Verification
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Host hackathons on HackFlow AI. Submissions are screened with AI verification.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full bg-[#1c1211] hover:bg-red-950 text-zinc-400 hover:text-white border border-red-900/30 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {applyResult ? (
              <div className="mt-6 space-y-4">
                <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Sparkles size={18} />
                    <span>Application Submitted Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-300 mt-1">
                    {applyResult.message}
                  </p>
                </div>

                {applyResult.application?.aiEvaluation && (
                  <div className="p-4 bg-[#170e0d] border border-red-950 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">AI Screening Score</span>
                      <span className="font-extrabold text-orange-400 bg-orange-950/80 border border-orange-500/30 px-2.5 py-0.5 rounded-md">
                        {applyResult.application.aiEvaluation.score}/100
                      </span>
                    </div>
                    <p className="text-zinc-300">
                      <strong className="text-orange-400">AI Summary:</strong> {applyResult.application.aiEvaluation.summary}
                    </p>
                    <p className="text-zinc-400">
                      <strong className="text-zinc-300">Recommendation:</strong> {applyResult.application.aiEvaluation.recommendation}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-950/50"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyOrganizer} className="space-y-4 mt-4">
                {applyError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl text-xs">
                    {applyError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Organization / Entity Name *
                  </label>
                  <input
                    required
                    value={applyForm.organizationName}
                    onChange={e => setApplyForm({ ...applyForm, organizationName: e.target.value })}
                    placeholder="e.g. Colombo Developers Guild or CyberSphere Tech"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Website / Portfolio URL
                    </label>
                    <input
                      value={applyForm.website}
                      onChange={e => setApplyForm({ ...applyForm, website: e.target.value })}
                      placeholder="https://example.org"
                      className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Estimated Participants
                    </label>
                    <input
                      type="number"
                      value={applyForm.estimatedParticipants}
                      onChange={e => setApplyForm({ ...applyForm, estimatedParticipants: e.target.value })}
                      placeholder="150"
                      className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Past Event Hosting Experience
                  </label>
                  <input
                    value={applyForm.pastEvents}
                    onChange={e => setApplyForm({ ...applyForm, pastEvents: e.target.value })}
                    placeholder="e.g. Organized 2 regional student hackathons in 2025"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Hackathon Concept & Mission Proposal *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={applyForm.proposal}
                    onChange={e => setApplyForm({ ...applyForm, proposal: e.target.value })}
                    placeholder="Describe the hackathon you intend to host, target participants, and prize commitments..."
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-950">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition cursor-pointer disabled:opacity-70 flex items-center gap-2"
                  >
                    {applying ? "Screening Proposal..." : "Submit Application"}
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
