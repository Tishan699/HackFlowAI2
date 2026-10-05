import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import EmailInboxDrawer from "../components/EmailInboxDrawer";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingUser, verifyEmailOtp, resendVerificationCode, loading } = useAuth();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(45);
  const [resendStatus, setResendStatus] = useState("");

  const inputRefs = useRef([]);

  const email = pendingUser?.email || location.state?.email || "you@example.com";

  // Focus the first input on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index, value) => {
    // Only accept numeric characters
    const char = value.replace(/[^0-9]/g, "");

    const newDigits = [...digits];
    newDigits[index] = char ? char[char.length - 1] : "";
    setDigits(newDigits);
    setError("");

    // If character entered, auto advance to next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits are populated
    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || digits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit security code.");
      return;
    }

    setError("");
    try {
      await verifyEmailOtp(code);
      setSuccess(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Fallback
      }

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    } catch (err) {
      setError(err?.message || "Invalid verification code. Please check your email.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    setResendStatus("");

    try {
      await resendVerificationCode(email);
      setResendStatus("A new 6-digit verification code was dispatched to your email!");
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleQuickFillFromInbox = (otp) => {
    const arr = otp.split("").slice(0, 6);
    setDigits(arr);
    handleVerify(otp);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#090707] flex flex-col justify-center items-center px-4 py-6 sm:py-8 relative overflow-y-auto selection:bg-orange-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-red-700/25 via-orange-600/20 to-amber-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Top Icon & Titles */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="inline-flex w-11 h-11 bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 rounded-xl items-center justify-center mb-2 shadow-lg shadow-red-950/60 border border-orange-400/30">
            <ShieldCheck size={24} className="text-white" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/40 text-orange-400 text-[11px] font-semibold mb-2">
            <Sparkles size={11} />
            <span>Multi-Factor Authentication (2FA)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-zinc-400 mt-1 text-xs">
            We've sent a 6-digit verification security code to:
          </p>
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 bg-[#170e0d] border border-red-950 rounded-lg text-xs font-mono font-bold text-orange-300">
            <Mail size={12} className="text-orange-400" />
            <span>{email}</span>
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-[#120c0b] rounded-2xl p-5 sm:p-6 shadow-2xl border border-red-900/40">
          {success ? (
            <div className="text-center py-4 space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Account Successfully Verified!
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Multi-Factor Authentication has been activated on your profile. Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="space-y-4"
            >
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {resendStatus && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                  <span>{resendStatus}</span>
                </div>
              )}

              {/* 6-digit OTP Inputs */}
              <div>
                <label className="block text-center text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5">
                  Enter 6-Digit Verification Code
                </label>

                <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      autoComplete="one-time-code"
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-black font-mono rounded-xl border-2 transition-all outline-none ${
                        digit
                          ? "border-orange-500 bg-orange-950/40 text-orange-300 shadow-md shadow-orange-950/50"
                          : "border-red-900/40 bg-[#1c1211] text-zinc-100 hover:border-red-800/60 focus:border-orange-500 focus:bg-[#251513]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || digits.join("").length < 6}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/60 border border-orange-400/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Verifying Security Code..." : "Verify & Activate Account"}
                <ArrowRight size={15} />
              </button>

              {/* Resend Controls & Info */}
              <div className="pt-3 border-t border-red-950 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Didn't receive email?</span>

                {cooldown > 0 ? (
                  <span className="text-zinc-400 font-medium">
                    Resend in <strong className="text-orange-400 font-mono font-bold">{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
                    {resending ? "Dispatching..." : "Resend Code"}
                  </button>
                )}
              </div>

              {/* Help & Switch Link */}
              <div className="text-center pt-1">
                <Link
                  to="/register"
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
                >
                  Mistake in email? Register with another address
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Floating Email Inbox Drawer Simulator with Quick Fill */}
      <EmailInboxDrawer onSelectOtp={handleQuickFillFromInbox} />
    </div>
  );
}
