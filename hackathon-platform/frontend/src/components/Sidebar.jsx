import {
  LayoutDashboard,
  Trophy,
  Users,
  FileText,
  UserCheck,
  GraduationCap,
  QrCode,
  Award,
  BarChart3,
  LogOut,
  X,
  Sparkles,
  Flame,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Hackathons",
      path: "/hackathons",
      icon: Trophy,
    },
    {
      name: "Teams",
      path: "/teams",
      icon: Users,
    },
    {
      name: "Submissions",
      path: "/submissions",
      icon: FileText,
    },
    {
      name: "Judges",
      path: "/judges",
      icon: UserCheck,
    },
    {
      name: "Mentors",
      path: "/mentors",
      icon: GraduationCap,
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: QrCode,
    },
    {
      name: "Certificates",
      path: "/certificates",
      icon: Award,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0d0909] text-zinc-100 z-50 flex flex-col transition-transform duration-300 ease-in-out border-r border-red-950/40 shadow-2xl shadow-red-950/20 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-red-950/40 flex items-center justify-between bg-gradient-to-r from-[#140c0b] to-[#0d0909]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 border border-orange-400/30">
              <Flame size={22} className="text-white animate-pulse" />
            </div>

            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-orange-200 to-red-400 bg-clip-text text-transparent font-heading">
                HackFlow AI
              </span>
              <div className="text-[10px] text-orange-400 font-semibold flex items-center gap-1 tracking-wider">
                <Sparkles size={10} className="text-red-400" /> BATTLE READY
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-red-950/40 transition"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-bold text-orange-500/80 uppercase tracking-widest flex items-center justify-between">
            <span>Navigation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          </div>

          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? "bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-lg shadow-red-600/30 border-orange-400/40 font-bold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-[#1c1211] border-transparent hover:border-red-900/30"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Role Quick Switcher & User info */}
        <div className="p-4 border-t border-red-950/50 space-y-3 bg-[#0a0707]">
          <div className="bg-[#170e0d] border border-red-900/40 rounded-xl p-3 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400 text-[11px]">Active Persona:</span>
              <span className="capitalize font-bold text-orange-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {user?.role || "organizer"}
              </span>
            </div>
            <select
              value={user?.role || "organizer"}
              onChange={(e) => switchRole(e.target.value)}
              className="w-full bg-[#0d0909] text-zinc-200 text-xs rounded-lg px-2.5 py-2 border border-red-900/50 outline-none focus:border-orange-500 cursor-pointer transition"
            >
              <option value="organizer">Organizer View</option>
              <option value="participant">Participant View</option>
              <option value="judge">Judge View</option>
              <option value="mentor">Mentor View</option>
            </select>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-zinc-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 text-xs font-bold transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
