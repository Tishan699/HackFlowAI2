import { useState, useEffect } from "react";
import { Users, Plus, Search, CheckCircle2, XCircle, ShieldCheck, UserPlus, X } from "lucide-react";
import { hackathonService } from "../services/api";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    leader: "",
    leaderEmail: "",
    projectTitle: "",
    hackathonTitle: "TechFest Sri Lanka 2026",
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const list = await hackathonService.getTeams();
    setTeams(list);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name) return;

    await hackathonService.createTeam({
      ...newTeam,
      members: [
        { name: newTeam.leader || "Leader", role: "Team Lead" },
      ]
    });

    setShowModal(false);
    setNewTeam({
      name: "",
      leader: "",
      leaderEmail: "",
      projectTitle: "",
      hackathonTitle: "TechFest Sri Lanka 2026",
    });
    loadTeams();
  };

  const handleToggleCheckIn = async (teamId) => {
    await hackathonService.toggleCheckIn(teamId);
    loadTeams();
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.leader?.toLowerCase().includes(search.toLowerCase()) ||
      t.projectTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Teams & Rosters
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Form teams, manage rosters, verify members, and track QR attendance check-ins.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {/* Search and Stats banner */}
      <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams, leaders, or projects..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
          <span>Total Teams: <strong className="text-orange-400">{teams.length}</strong></span>
          <span>Checked In: <strong className="text-emerald-400">{teams.filter(t => t.checkedIn).length}</strong></span>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="bg-[#120c0b] border border-red-950/80 hover:border-orange-500/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-red-950/60">
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-orange-300 transition-colors">{team.name}</h3>
                  <span className="text-xs text-orange-400 font-semibold">
                    {team.hackathonTitle || "TechFest 2026"}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleCheckIn(team.id)}
                  title="Click to toggle check-in state"
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                    team.checkedIn
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60"
                      : "bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60"
                  }`}
                >
                  {team.checkedIn ? (
                    <>
                      <CheckCircle2 size={13} /> Checked In
                    </>
                  ) : (
                    <>
                      <XCircle size={13} /> Not Checked In
                    </>
                  )}
                </button>
              </div>

              {team.projectTitle && (
                <div className="my-3 p-3 bg-[#170e0d] border border-red-950/60 rounded-xl text-xs">
                  <span className="text-zinc-500 block font-medium">Project:</span>
                  <span className="font-bold text-zinc-200">{team.projectTitle}</span>
                </div>
              )}

              {/* Members List */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                  Roster ({team.members?.length || 1})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(team.members || [{ name: team.leader, role: "Lead" }]).map(
                    (m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-[#170e0d] border border-red-950/60"
                      >
                        <span className="font-medium text-zinc-200">{m.name}</span>
                        <span className="text-[10px] text-amber-300 font-bold bg-[#1c1211] px-2 py-0.5 rounded-md border border-orange-500/30">
                          {m.role}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-red-950/60 flex items-center justify-between text-xs text-zinc-400">
              <span>Leader: <strong className="text-zinc-200">{team.leader}</strong></span>
              <button
                onClick={() => handleToggleCheckIn(team.id)}
                className="text-orange-400 font-bold hover:text-orange-300 transition-colors"
              >
                {team.checkedIn ? "Undo Check-in" : "QR Check-in"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#120c0b] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-900/60 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-red-950/60">
              <h3 className="text-xl font-extrabold text-white font-heading">
                Create New Team
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Team Name *
                </label>
                <input
                  required
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g. AlgoRhythms"
                  className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Team Leader Name *
                </label>
                <input
                  required
                  value={newTeam.leader}
                  onChange={(e) => setNewTeam({ ...newTeam, leader: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Project Title / Concept
                </label>
                <input
                  value={newTeam.projectTitle}
                  onChange={(e) => setNewTeam({ ...newTeam, projectTitle: e.target.value })}
                  placeholder="e.g. AI Vision Diagnostic"
                  className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-red-950/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
