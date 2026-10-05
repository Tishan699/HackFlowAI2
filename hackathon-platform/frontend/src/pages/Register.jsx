import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import EmailInboxDrawer from "../components/EmailInboxDrawer";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await register(form);
      if (result.requiresVerification) {
        // Navigate to the verification & Multi-Factor Authentication screen
        navigate("/verify-email", { state: { email: form.email } });
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#090707] flex flex-col justify-center items-center px-4 py-6 sm:py-8 relative overflow-y-auto selection:bg-orange-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/15 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-lg relative z-10 my-auto">
        <div className="text-center mb-4 sm:mb-5">
          <Link
            to="/"
            className="inline-flex w-10 h-10 bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 rounded-xl items-center justify-center mb-2 shadow-lg shadow-red-950/60 border border-orange-400/30 hover:scale-105 transition"
          >
            <Trophy size={20} className="text-white" />
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Create an Account
          </h1>
          <p className="text-zinc-400 mt-1 text-xs sm:text-sm">
            Join thousands of innovators building the future on HackFlow AI
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#120c0b] rounded-2xl p-5 sm:p-6 shadow-2xl border border-red-900/40"
        >
          {error && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Rivera"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Organization / University
              </label>
              <input
                name="organization"
                value={form.organization}
                onChange={handleChange}
                placeholder="University / Tech Co"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Primary Skills & Technical Focus
            </label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="e.g. Python, React, Cloud, Machine Learning"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Compact Role & 2FA Info Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <div className="p-2.5 bg-[#170e0d] border border-red-950 rounded-xl flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400">Initial Role:</span>
              <span className="px-2 py-0.5 rounded-md bg-red-950/80 border border-red-900/40 text-orange-300 font-bold text-[10px] tracking-wide uppercase">
                Participant
              </span>
            </div>

            <div className="p-2.5 bg-[#1e1311] border border-orange-500/20 rounded-xl flex items-center gap-1.5 text-[11px] text-orange-300 font-medium">
              <ShieldCheck size={14} className="text-orange-400 shrink-0" />
              <span>Email 2FA OTP Protected</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-950/60 border border-orange-400/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Sending Verification Code..." : "Create Account & Send Verification Email"}
            <ArrowRight size={15} />
          </button>

          <p className="text-center text-xs text-zinc-400 mt-3.5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-orange-400 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>

      <EmailInboxDrawer />
    </div>
  );
}
