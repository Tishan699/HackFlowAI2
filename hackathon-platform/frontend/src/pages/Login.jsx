import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Trophy,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Code,
  Users,
  Lock,
  Mail,
  RefreshCw,
  AlertCircle,
  KeyRound,
  Building,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import EmailInboxDrawer from "../components/EmailInboxDrawer";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyLogin2Fa, resendVerificationCode, loading } = useAuth();

  const [email, setEmail] = useState("organizer@hackflow.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  // Step 2: MFA 2FA Challenge state
  const [is2FaStep, setIs2FaStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resending2Fa, setResending2Fa] = useState(false);
  const [resendNotice, setResendNotice] = useState("");

  const inputRefs = useRef([]);

  const from = location.state?.from?.pathname || "/dashboard";

  // Step 1: Initial Login Credentials Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password);
      if (result?.mfaRequired) {
        setIs2FaStep(true);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  // Step 2: 2FA OTP Code Verification
  const handleVerify2Fa = async (codeToUse) => {
    const code = codeToUse || otpDigits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit security code.");
      return;
    }

    setError("");
    try {
      await verifyLogin2Fa(code);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid 2FA code. Please check your email.");
    }
  };

  const handleDigitChange = (index, value) => {
    const char = value.replace(/[^0-9]/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = char ? char[char.length - 1] : "";
    setOtpDigits(newDigits);
    setError("");

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      handleVerify2Fa(fullCode);
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
      handleVerify2Fa(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleResend2Fa = async () => {
    setResending2Fa(true);
    setError("");
    try {
      await resendVerificationCode(email);
      setResendNotice("A fresh 2FA code was sent to your email.");
    } catch (err) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setResending2Fa(false);
    }
  };



  const handleFillFromInbox = (code) => {
    setOtpDigits(code.split("").slice(0, 6));
    handleVerify2Fa(code);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#090707] flex flex-col justify-center items-center px-4 py-6 sm:py-8 relative overflow-y-auto selection:bg-orange-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/15 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-5">
          <Link
            to="/"
            className="inline-flex w-10 h-10 bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 rounded-xl items-center justify-center mb-2 shadow-lg shadow-red-950/60 border border-orange-400/30 hover:scale-105 transition"
          >
            {is2FaStep ? <KeyRound size={20} className="text-white" /> : <Trophy size={20} className="text-white" />}
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            {is2FaStep ? "Two-Factor Authentication" : "Welcome Back"}
          </h1>
          <p className="text-zinc-400 mt-1 text-xs sm:text-sm">
            {is2FaStep
              ? "Enter the 6-digit security code sent to your email"
              : "Sign in to access your HackFlow AI workspace"}
          </p>
        </div>

        {/* Step 2: 2FA MFA Challenge Form */}
        {is2FaStep ? (
          <div className="bg-[#120c0b] rounded-2xl p-5 sm:p-6 shadow-2xl border border-red-900/40 animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 p-3 bg-[#1e1311] rounded-xl border border-orange-500/20 flex items-center gap-2 text-xs text-orange-300">
              <Mail size={15} className="text-orange-400 shrink-0" />
              <span className="truncate">
                Code sent to: <strong className="font-semibold text-white">{email}</strong>
              </span>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {resendNotice && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 font-semibold">
                {resendNotice}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify2Fa();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-center text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5">
                  6-Digit Security Code
                </label>

                <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handlePasteOtp}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      autoComplete="one-time-code"
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-black font-mono rounded-xl border-2 transition-all outline-none ${
                        digit
                          ? "border-orange-500 bg-orange-950/40 text-orange-300"
                          : "border-red-900/40 bg-[#1c1211] text-zinc-100 focus:border-orange-500"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join("").length < 6}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/60 border border-orange-400/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Validating Code..." : "Authorize Session"}
                <ArrowRight size={15} />
              </button>

              <div className="pt-2 border-t border-red-950 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResend2Fa}
                  disabled={resending2Fa}
                  className="text-orange-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} className={resending2Fa ? "animate-spin" : ""} />
                  {resending2Fa ? "Resending..." : "Resend code"}
                </button>

                <button
                  type="button"
                  onClick={() => setIs2FaStep(false)}
                  className="text-zinc-400 hover:text-white font-medium cursor-pointer"
                >
                  Back to login
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Step 1: Standard Login Form */
          <>


            {/* Main Login Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-[#120c0b] rounded-2xl p-5 sm:p-6 shadow-2xl border border-red-900/40"
            >
              {error && (
                <div className="mb-3.5 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 font-medium">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1c1211] border border-red-900/40 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-950/60 border border-orange-400/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Authenticating..." : "Sign In to HackFlow AI"}
                <ArrowRight size={15} />
              </button>

              <p className="text-center text-xs text-zinc-400 mt-4">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-orange-400 font-semibold hover:underline"
                >
                  Create free account
                </Link>
              </p>
            </form>
          </>
        )}
      </div>

      <EmailInboxDrawer onSelectOtp={handleFillFromInbox} />
    </div>
  );
}
