import { useState } from "react";
import { Bell, Search, Menu, CheckCircle2, Trophy, Clock, ShieldCheck, Flame, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import EmailInboxDrawer from "./EmailInboxDrawer";

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Project Submission",
      desc: "Team NeuralNinjas submitted MedVision AI Diagnostics.",
      time: "10 mins ago",
      icon: Trophy,
      read: false,
    },
    {
      id: 2,
      title: "AI Code Analysis Ready",
      desc: "Submission scored 92/100 (Clean authenticity, 0 security flaws).",
      time: "25 mins ago",
      icon: CheckCircle2,
      read: false,
    },
    {
      id: 3,
      title: "Registration Countdown",
      desc: "TechFest registration closes in 48 hours.",
      time: "2 hours ago",
      icon: Clock,
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-[#0d0909]/90 backdrop-blur-xl border-b border-red-950/50 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-lg shadow-black/40">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/70"
          />
          <input
            type="search"
            placeholder="Search competitions, teams, code reviews..."
            className="pl-10 pr-4 py-2 bg-[#18100f] border border-red-900/30 text-zinc-100 placeholder:text-zinc-500 rounded-xl outline-none text-xs sm:text-sm w-48 sm:w-72 md:w-80 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-inner"
          />
        </div>
      </div>

      {/* Right: Notifications & User profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl hover:bg-[#1c1211] border border-transparent hover:border-red-900/40 flex items-center justify-center text-zinc-300 hover:text-white transition relative"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#0d0909] rounded-full animate-pulse shadow-sm shadow-red-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#140c0b] border border-red-900/50 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-red-950/60">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
                    <Flame size={15} className="text-orange-500" /> Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-950/80 border border-red-800/60 text-red-300 text-[11px] px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllRead}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                >
                  Mark all as read
                </button>
              </div>

              <div className="divide-y divide-red-950/40 max-h-72 overflow-y-auto mt-2 custom-scrollbar">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl flex items-start gap-3 transition ${
                        n.read ? "bg-transparent" : "bg-red-950/20 border border-red-900/30"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#241311] border border-red-800/40 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-zinc-100">
                          {n.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-zinc-500 mt-1 block font-mono">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-red-950/60">
          <div className="w-9 h-9 bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md shadow-red-600/30 border border-orange-400/30">
            {user?.avatar || "JD"}
          </div>

          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-zinc-100 leading-tight">
                {user?.name || "John Doe"}
              </p>
              {user?.isEmailVerified && (
                <ShieldCheck size={14} className="text-orange-400" title="Verified Account" />
              )}
            </div>
            <p className="text-[11px] font-bold text-orange-500 capitalize tracking-wide">
              {user?.role || "organizer"}
            </p>
          </div>
        </div>
      </div>

      <EmailInboxDrawer />
    </header>
  );
}
