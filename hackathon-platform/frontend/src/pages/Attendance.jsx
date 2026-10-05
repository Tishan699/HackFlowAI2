import { useState, useEffect } from "react";
import { QrCode, Search, CheckCircle2, Clock, Camera, RefreshCw, Sparkles } from "lucide-react";
import { hackathonService } from "../services/api";

export default function Attendance() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const list = await hackathonService.getTeams();
    setTeams(list);
  };

  const handleToggle = async (teamId) => {
    await hackathonService.toggleCheckIn(teamId);
    loadTeams();
  };

  const simulateQrScan = () => {
    setScanning(true);
    setScanMessage("Scanning QR badge via optical camera...");

    setTimeout(async () => {
      // Find first unchecked team or toggle first team
      const targetTeam = teams.find((t) => !t.checkedIn) || teams[0];
      if (targetTeam) {
        await hackathonService.toggleCheckIn(targetTeam.id);
        setScanMessage(`Verified! Team ${targetTeam.name} has been checked in.`);
        loadTeams();
      } else {
        setScanMessage("All registered teams are already checked in!");
      }
      setScanning(false);
    }, 1200);
  };

  const total = teams.length;
  const present = teams.filter((t) => t.checkedIn).length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const filtered = teams.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.leader?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            QR Attendance & Check-In
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Fast, contactless QR check-in system for hackathon participants, mentors, and judges.
          </p>
        </div>

        <button
          onClick={simulateQrScan}
          disabled={scanning}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition cursor-pointer"
        >
          <Camera size={18} />
          <span>{scanning ? "Scanning..." : "Simulate QR Scan"}</span>
        </button>
      </div>

      {/* Camera Scanner Simulation & Progress Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scanner Simulation Window */}
        <div className="bg-[#120c0b] text-white p-6 rounded-3xl border border-red-950/80 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-orange-500/50 p-4 flex flex-col items-center justify-center relative bg-[#170e0d] backdrop-blur-md">
            <QrCode size={90} className="text-orange-400" />
            {scanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-bounce" />
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs font-semibold text-zinc-300">
              {scanMessage || "Point physical or digital QR badge at camera lens."}
            </p>
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block mt-1">
              Optical QR Reader Ready
            </span>
          </div>
        </div>

        {/* Attendance Stats Progress */}
        <div className="lg:col-span-2 bg-[#120c0b] border border-red-950/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-red-950/60">
              <h2 className="font-bold text-white text-lg">Check-in Progress</h2>
              <span className="text-xs font-bold text-amber-300 bg-red-950/80 border border-orange-500/30 px-3 py-1 rounded-full">
                {percentage}% Checked In
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-[#170e0d] rounded-2xl border border-red-950/60">
                <span className="text-xs text-zinc-400 block font-medium">Total Registered</span>
                <span className="text-2xl font-black text-white font-heading">{total} Teams</span>
              </div>
              <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/30">
                <span className="text-xs text-emerald-400 block font-medium">Present On-site</span>
                <span className="text-2xl font-black text-emerald-300 font-heading">{present} Teams</span>
              </div>
              <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30 col-span-2 sm:col-span-1">
                <span className="text-xs text-amber-400 block font-medium">Pending Arrival</span>
                <span className="text-2xl font-black text-amber-300 font-heading">{total - present} Teams</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1c1211] rounded-full h-3 overflow-hidden border border-red-950/60">
              <div
                className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-red-950/60 flex items-center justify-between text-xs text-zinc-400">
            <span>Real-time QR verification sync</span>
            <button
              onClick={loadTeams}
              className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold"
            >
              <RefreshCw size={13} /> Refresh List
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-red-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team or leader..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <span className="text-xs font-semibold text-zinc-400">
            Showing {filtered.length} of {teams.length} teams
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#170e0d] text-zinc-400 font-semibold border-b border-red-950/60 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Team Name</th>
                <th className="py-3.5 px-5">Leader</th>
                <th className="py-3.5 px-5">Project Title</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Check-In Time</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/40">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-red-950/20 transition">
                  <td className="py-3.5 px-5 font-bold text-white">{t.name}</td>
                  <td className="py-3.5 px-5 text-zinc-300">{t.leader}</td>
                  <td className="py-3.5 px-5 text-zinc-300">{t.projectTitle || "N/A"}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        t.checkedIn
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                          : "bg-[#1c1211] text-zinc-400 border border-red-950/60"
                      }`}
                    >
                      {t.checkedIn ? "Checked In" : "Absent"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-zinc-400">
                    {t.checkInTime || "--"}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleToggle(t.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        t.checkedIn
                          ? "bg-[#1c1211] text-zinc-300 hover:bg-red-950/50 border border-red-950/60"
                          : "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-md shadow-red-950/60"
                      }`}
                    >
                      {t.checkedIn ? "Undo" : "Check In"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
