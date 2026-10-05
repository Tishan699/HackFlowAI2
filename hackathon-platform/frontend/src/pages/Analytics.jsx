import { useState } from "react";
import { BarChart3, TrendingUp, Users, Trophy, Download, PieChart, Sparkles, Filter } from "lucide-react";

export default function Analytics() {
  const [selectedHackathon, setSelectedHackathon] = useState("all");

  const tracks = [
    { name: "AI & Machine Learning", percentage: 44, count: "214 Teams", color: "bg-gradient-to-r from-red-600 to-orange-500" },
    { name: "Cloud & DevOps Architecture", percentage: 26, count: "126 Teams", color: "bg-gradient-to-r from-orange-600 to-amber-500" },
    { name: "FinTech & Open Banking", percentage: 18, count: "88 Teams", color: "bg-gradient-to-r from-amber-600 to-yellow-500" },
    { name: "HealthTech & BioInformatics", percentage: 12, count: "59 Teams", color: "bg-gradient-to-r from-emerald-600 to-teal-500" },
  ];

  const scoreBuckets = [
    { range: "90 - 100 (Exceptional)", count: 8, height: "h-28", color: "bg-gradient-to-t from-emerald-700 to-emerald-400" },
    { range: "80 - 89 (Strong)", count: 24, height: "h-40", color: "bg-gradient-to-t from-red-700 via-orange-600 to-amber-400" },
    { range: "70 - 79 (Good)", count: 18, height: "h-32", color: "bg-gradient-to-t from-orange-700 to-amber-500" },
    { range: "60 - 69 (Average)", count: 6, height: "h-16", color: "bg-gradient-to-t from-amber-700 to-yellow-600" },
    { range: "< 60 (Needs Work)", count: 2, height: "h-8", color: "bg-gradient-to-t from-red-950 to-rose-700" },
  ];

  const handleExport = () => {
    alert("Exporting Hackathon Analytics Summary CSV report...");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Competition Analytics & Insights
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time telemetry, track popularity, submission completion, and judging distribution metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedHackathon}
            onChange={(e) => setSelectedHackathon(e.target.value)}
            className="px-3.5 py-2 bg-[#1c1211] border border-red-900/40 rounded-xl text-xs font-semibold text-zinc-200 outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all" className="bg-[#1c1211]">All Hackathons Combined</option>
            <option value="1" className="bg-[#1c1211]">TechFest Sri Lanka 2026</option>
            <option value="2" className="bg-[#1c1211]">AI Innovation Challenge</option>
            <option value="3" className="bg-[#1c1211]">Cloud Hack 2026</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition cursor-pointer"
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Primary KPI highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-zinc-400 font-medium">Conversion Rate</span>
          <h2 className="text-3xl font-black text-white font-heading mt-1">78.4%</h2>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-2">
            <TrendingUp size={13} /> +6.1% registered to submitted
          </span>
        </div>

        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-zinc-400 font-medium">Average Team Size</span>
          <h2 className="text-3xl font-black text-white font-heading mt-1">3.4</h2>
          <span className="text-xs text-zinc-500 mt-2 block">Members per project</span>
        </div>

        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-zinc-400 font-medium">Mean AI Score</span>
          <h2 className="text-3xl font-black text-orange-400 font-heading mt-1">86.2</h2>
          <span className="text-xs text-amber-300 font-bold flex items-center gap-1 mt-2">
            <Sparkles size={13} /> Across 58 evaluations
          </span>
        </div>

        <div className="bg-[#120c0b] border border-red-950/80 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-zinc-400 font-medium">Mentorship Utilization</span>
          <h2 className="text-3xl font-black text-amber-400 font-heading mt-1">92%</h2>
          <span className="text-xs text-amber-300 font-bold mt-2 block">Available slots booked</span>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Track / Category Breakdown */}
        <div className="bg-[#120c0b] border border-red-950/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-red-950/60">
            <h3 className="font-bold text-white text-base">Track Distribution</h3>
            <span className="text-xs text-zinc-400 font-medium">By team registrations</span>
          </div>

          <div className="space-y-5 mt-6">
            {tracks.map((track) => (
              <div key={track.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-200">{track.name}</span>
                  <span className="text-zinc-400">
                    {track.count} ({track.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#1c1211] rounded-full h-3 overflow-hidden border border-red-950/60">
                  <div
                    className={`${track.color} h-3 rounded-full transition-all duration-700`}
                    style={{ width: `${track.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Judging Score Distribution Histogram */}
        <div className="bg-[#120c0b] border border-red-950/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-red-950/60">
              <h3 className="font-bold text-white text-base">Project Score Distribution</h3>
              <span className="text-xs text-zinc-400 font-medium">Combined AI + Judge points</span>
            </div>

            {/* Histogram bars */}
            <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2 border-b border-red-950/60">
              {scoreBuckets.map((bucket) => (
                <div key={bucket.range} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-zinc-300">{bucket.count}</span>
                  <div
                    className={`w-full ${bucket.color} ${bucket.height} rounded-t-xl transition-all duration-500 hover:opacity-90 shadow-lg`}
                  />
                </div>
              ))}
            </div>

            {/* Labels */}
            <div className="flex justify-between text-[10px] text-zinc-400 pt-2 font-medium">
              <span>90-100</span>
              <span>80-89</span>
              <span>70-79</span>
              <span>60-69</span>
              <span>&lt;60</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-red-950/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>Standard Deviation: <strong className="text-zinc-200">5.4 pts</strong></span>
            <span className="text-emerald-400 font-bold">Normal Distribution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
