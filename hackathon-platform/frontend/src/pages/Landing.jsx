import { Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Brain,
  QrCode,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Zap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Trophy,
      title: "Hackathon Management",
      description:
        "Manage competitions, registrations, schedules, teams, and live judging tracks from one unified dashboard.",
      tag: "Organizer Suite",
    },
    {
      icon: Brain,
      title: "AI-Powered Evaluation",
      description:
        "Instant automated repository and rubric analysis that scores projects and generates structured judge notes.",
      tag: "Smart Assist",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Frictionless team formation, matchmaking, mentor booking, and project repository synchronization.",
      tag: "Real-time Sync",
    },
    {
      icon: QrCode,
      title: "Instant QR Check-ins",
      description:
        "Speed through physical and virtual participant check-ins with camera and badge QR scanning.",
      tag: "Speed Check-in",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      description:
        "Live dashboards tracking participant signups, track distributions, judging progress, and leaderboard rankings.",
      tag: "Live Metrics",
    },
  ];

  const metrics = [
    { label: "Active Competitions", value: "24+" },
    { label: "Innovators & Builders", value: "12,400+" },
    { label: "Prizes Awarded", value: "$350,000+" },
    { label: "AI Evaluations Run", value: "3,800+" },
  ];

  return (
    <div className="min-h-screen bg-[#090707] text-white selection:bg-orange-600 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-red-700/25 via-orange-600/20 to-amber-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-96 right-0 w-[500px] h-[500px] bg-red-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Navbar */}
      <nav className="border-b border-red-950/80 sticky top-0 z-40 bg-[#090707]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/60 border border-orange-400/30">
              <Trophy size={22} className="text-white" />
            </div>

            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-orange-100 to-red-300 bg-clip-text text-transparent">
                HackFlow AI
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-300 font-medium">
            <a href="#features" className="hover:text-orange-400 transition">
              Features
            </a>
            <a href="#ai-eval" className="hover:text-orange-400 transition flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-400" /> AI Judging
            </a>
            <Link to="/hackathons" className="hover:text-orange-400 transition">
              Explore Hackathons
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-zinc-300 hover:text-white font-medium transition"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-xl hover:from-red-500 hover:to-amber-500 text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-800/50 text-orange-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-lg shadow-red-950/50">
            <Sparkles size={16} className="text-orange-400" />
            <span>Next-Gen Hackathon Management with AI Evaluation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] font-heading">
            Manage your{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              hackathons
            </span>{" "}
            smarter and faster.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The end-to-end platform for organizers, hackers, mentors, and judges.
            Seamless team formation, instant QR attendance, automated AI evaluation,
            and real-time leaderboards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-xl font-bold text-white shadow-xl shadow-red-950/60 border border-orange-400/30 transition transform hover:-translate-y-0.5"
            >
              Create a Hackathon
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#1c1211] border border-red-900/40 hover:bg-red-950/60 rounded-xl font-semibold text-zinc-200 transition"
            >
              Live Demo Dashboard
              <ChevronRight size={18} className="text-orange-400" />
            </Link>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="mt-20 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#120c0b] border border-red-950/80 backdrop-blur-md shadow-xl">
          {metrics.map((m) => (
            <div key={m.label} className="text-center p-3">
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                {m.value}
              </div>
              <div className="text-xs text-orange-400 font-medium mt-1">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive AI Evaluation Preview Showcase */}
      <section id="ai-eval" className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-[#120c0b] border border-red-950/80 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-950/80 border border-red-800/40 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Brain size={14} /> AI Evaluation Engine
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
                Instant submission analysis before your judges sit down.
              </h2>
              <p className="mt-4 text-zinc-400 leading-relaxed text-sm sm:text-base">
                HackFlow AI parses project repositories, analyzes code complexity,
                verifies build status, and grades deliverables against your custom
                rubrics so human judges can focus on high-impact insights.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  <span>Automated tech stack detection and repo health scoring</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  <span>Weighted rubrics: Innovation, Architecture, UI/UX & Impact</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  <span>Generative constructive feedback notes delivered to teams</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/submissions"
                  className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold text-sm"
                >
                  Explore sample submissions <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Mock AI Score Card preview */}
            <div className="bg-[#170e0d] border border-red-950 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-red-950">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-950/50">
                    AI
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">MedVision AI Diagnostics</h3>
                    <span className="text-[11px] text-zinc-400">Team NeuralNinjas</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400 font-heading">92/100</div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">AI Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-[#120c0b] p-3 rounded-xl border border-red-950">
                  <span className="text-[11px] text-zinc-400 block">Innovation</span>
                  <span className="text-lg font-bold text-orange-400">9.5 / 10</span>
                </div>
                <div className="bg-[#120c0b] p-3 rounded-xl border border-red-950">
                  <span className="text-[11px] text-zinc-400 block">Technical Architecture</span>
                  <span className="text-lg font-bold text-orange-400">9.2 / 10</span>
                </div>
                <div className="bg-[#120c0b] p-3 rounded-xl border border-red-950">
                  <span className="text-[11px] text-zinc-400 block">Design & Polish</span>
                  <span className="text-lg font-bold text-orange-400">9.0 / 10</span>
                </div>
                <div className="bg-[#120c0b] p-3 rounded-xl border border-red-950">
                  <span className="text-[11px] text-zinc-400 block">Feasibility & Impact</span>
                  <span className="text-lg font-bold text-orange-400">9.3 / 10</span>
                </div>
              </div>

              <div className="p-3 bg-[#1f1311] border border-orange-500/20 rounded-xl text-xs text-orange-200">
                <span className="font-semibold text-orange-400">Feedback: </span>
                "Outstanding multimodal edge deployment. Clean modular separation between vision encoder and clinical query engine."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
            Engineered for Modern Competitions
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-3">
            Every feature you need to organize, participate, mentor, and evaluate hackathons seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-[#120c0b] border border-red-950/80 hover:border-orange-500/50 hover:bg-[#170e0d] transition-all duration-300 group flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#1c1211] text-orange-400 border border-red-900/40 flex items-center justify-center group-hover:scale-110 group-hover:border-orange-500/50 transition duration-300 shadow-md">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-300 bg-red-950/80 border border-red-900/40 px-2 py-0.5 rounded-full">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2.5 text-white group-hover:text-orange-400 transition">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-red-950 flex items-center text-xs font-semibold text-orange-400 group-hover:text-orange-300">
                  Learn more <ArrowRight size={13} className="ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-red-950/80 py-12 text-zinc-400 text-xs bg-[#090707]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-orange-500" />
            <span className="font-bold text-white text-sm">HackFlow AI</span>
            <span>&copy; {new Date().getFullYear()} HackFlow AI Platform. Built for innovators.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/hackathons" className="hover:text-orange-400 transition">
              Hackathons
            </Link>
            <Link to="/login" className="hover:text-orange-400 transition">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-orange-400 transition">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
