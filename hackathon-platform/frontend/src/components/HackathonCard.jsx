import { Link } from "react-router-dom";
import { Calendar, Users, Award, MapPin, ArrowRight, Edit3, Building, ShieldCheck, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function HackathonCard({ hackathon }) {
  const { user } = useAuth();

  const getGradient = (id) => {
    const num = Number(id) || 1;
    if (num % 3 === 1) return "from-red-700 via-orange-600 to-amber-700";
    if (num % 3 === 2) return "from-rose-700 via-red-700 to-orange-800";
    return "from-amber-700 via-orange-700 to-red-800";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
      case "upcoming":
        return "bg-orange-500/20 text-orange-300 border-orange-400/30";
      case "ended":
      case "concluded":
        return "bg-zinc-800/60 text-zinc-400 border-zinc-700/40";
      default:
        return "bg-red-500/20 text-red-200 border-red-400/30";
    }
  };

  const isOwner = Boolean(
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

  const getEventStateBadge = (state) => {
    switch (state?.toUpperCase()) {
      case "DRAFT":
        return { label: "Draft Mode", color: "bg-amber-500/25 text-amber-300 border-amber-400/40" };
      case "REGISTRATION_CLOSED":
        return { label: "Reg. Closed", color: "bg-red-600/30 text-red-300 border-red-500/40" };
      case "ONGOING":
        return { label: "Live Now", color: "bg-emerald-500/25 text-emerald-300 border-emerald-400/40" };
      case "COMPLETED":
        return { label: "Archived", color: "bg-zinc-700/40 text-zinc-300 border-zinc-600/40" };
      default:
        return null;
    }
  };

  const stateBadge = getEventStateBadge(hackathon.eventState);

  return (
    <div className={`bg-[#120c0b] border ${hackathon.eventState === 'DRAFT' ? 'border-amber-500/60 ring-2 ring-amber-500/20' : 'border-red-950/60 hover:border-orange-500/50'} rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-red-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative`}>
      <div>
        {/* Banner with Volcanic Gradient */}
        <div
          className={`h-38 bg-gradient-to-br ${getGradient(hackathon.id)} p-5 text-white relative flex flex-col justify-between overflow-hidden`}
        >
          {/* Flame ambient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border backdrop-blur-md ${getStatusColor(
                  hackathon.status
                )}`}
              >
                {hackathon.badge || hackathon.status || "Active"}
              </span>

              {stateBadge && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border backdrop-blur-md ${stateBadge.color}`}>
                  {stateBadge.label}
                </span>
              )}

              {isOwner && (
                <span className="text-[11px] bg-amber-500/30 border border-amber-400/50 text-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 backdrop-blur-md">
                  Your Event
                </span>
              )}
            </div>

            {hackathon.prizePool && (
              <span className="text-xs bg-black/40 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 backdrop-blur-md shadow-sm">
                <Award size={13} className="text-amber-400" />
                {hackathon.prizePool}
              </span>
            )}
          </div>

          <div className="relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-200/90 flex items-center gap-1">
              <Flame size={12} className="text-yellow-300" /> {hackathon.category || "Hackathon"}
            </span>
            <h2 className="text-xl font-black line-clamp-1 text-white group-hover:text-orange-200 transition font-heading">
              {hackathon.title}
            </h2>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 min-h-[40px] mb-4 leading-relaxed">
            {hackathon.description || hackathon.tagline}
          </p>

          <div className="space-y-2 text-xs text-zinc-400 border-t border-red-950/50 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-orange-400 shrink-0" />
                <span className="text-zinc-300">{hackathon.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Users size={14} className="text-red-400 shrink-0" />
                <span>{hackathon.participants || 0} Hackers</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                <Building size={13} className="text-orange-500/70 shrink-0" />
                <span className="truncate text-zinc-300">{hackathon.organizer || "Host"}</span>
              </div>

              {hackathon.location && (
                <div className="flex items-center gap-1 text-zinc-400 shrink-0">
                  <MapPin size={13} className="text-red-400" />
                  <span>{hackathon.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Link */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2">
          {isOwner ? (
            <>
              <Link
                to={`/hackathons/${hackathon.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl transition duration-200 shadow-md shadow-amber-900/40"
              >
                <Edit3 size={13} />
                Edit Details
              </Link>
              <Link
                to={`/hackathons/${hackathon.id}`}
                className="flex items-center justify-center p-2.5 bg-[#1f1311] hover:bg-red-600 hover:text-white text-zinc-300 rounded-xl border border-red-900/40 transition"
                title="View Full Competition"
              >
                <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <Link
              to={`/hackathons/${hackathon.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-950/50 transition duration-200 transform group-hover:translate-x-0.5"
            >
              <span>View Details & Enter</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
