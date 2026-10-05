import { useState } from "react";
import { Mail, X, Check, Copy, Clock, ShieldCheck, ChevronRight, Inbox } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function EmailInboxDrawer({ onSelectOtp }) {
  const { sentEmails } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeEmail, setActiveEmail] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const unreadCount = sentEmails.length;
  const currentEmail = activeEmail || sentEmails[0];

  const handleCopy = (otp, id) => {
    navigator.clipboard?.writeText(otp);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickFill = (otp) => {
    if (onSelectOtp) {
      onSelectOtp(otp);
      setIsOpen(false);
    }
  };

  if (!sentEmails || sentEmails.length === 0) return null;

  return (
    <>
      {/* Floating Trigger Pill in bottom-right corner */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#170e0d] text-white rounded-full shadow-2xl border border-red-900/60 hover:border-orange-500/60 hover:scale-105 transition-all duration-200 cursor-pointer group"
      >
        <div className="relative">
          <Mail size={18} className="text-orange-400 group-hover:text-amber-300" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-r from-red-600 to-orange-600 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        </div>
        <span className="text-xs font-bold tracking-tight text-zinc-100">
          Dispatched Mails ({unreadCount})
        </span>
      </button>

      {/* Drawer Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120c0b] rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[85vh] shadow-2xl border border-red-900/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#0e0807] border-b border-red-950/80 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-orange-500/40 flex items-center justify-center">
                  <Inbox size={17} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Dispatched Mail Simulator</h3>
                  <p className="text-[11px] text-zinc-400">Incoming emails sent by HackFlow AI platform</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1c1211] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email Selector Tabs (if multiple emails exist) */}
            {sentEmails.length > 1 && (
              <div className="flex items-center gap-2 p-2.5 bg-[#170e0d] border-b border-red-950/60 overflow-x-auto text-xs">
                {sentEmails.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveEmail(item)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition ${
                      (currentEmail?.id === item.id)
                        ? "bg-[#1c1211] text-orange-400 border border-orange-500/30 font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Email #{idx + 1}: {item.purpose?.slice(0, 16)}...
                  </button>
                ))}
              </div>
            )}

            {/* Email Content Body */}
            {currentEmail ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* Email Metadata */}
                <div className="p-3.5 bg-[#170e0d] rounded-2xl border border-red-950/60 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">To:</span>
                    <strong className="text-zinc-200">{currentEmail.to}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">From:</span>
                    <span className="text-zinc-300">{currentEmail.from}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Subject:</span>
                    <strong className="text-white">{currentEmail.subject}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-red-950/60">
                    <span className="text-zinc-500 text-[10px] flex items-center gap-1">
                      <Clock size={12} /> {currentEmail.sentAt} on {currentEmail.fullDate}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      Delivered
                    </span>
                  </div>
                </div>

                {/* Quick Action OTP banner */}
                {currentEmail.otp && (
                  <div className="p-4 bg-gradient-to-r from-[#1c1211] to-[#251412] border border-red-900/50 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                        Security Verification Code
                      </span>
                      <span className="text-2xl font-black font-mono tracking-widest text-amber-300">
                        {currentEmail.otp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(currentEmail.otp, currentEmail.id)}
                        className="px-3 py-1.5 bg-[#120c0b] hover:bg-red-950/60 text-zinc-200 rounded-xl text-xs font-semibold border border-red-900/40 flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        {copiedId === currentEmail.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        {copiedId === currentEmail.id ? "Copied" : "Copy"}
                      </button>

                      {onSelectOtp && (
                        <button
                          onClick={() => handleQuickFill(currentEmail.otp)}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/60 transition cursor-pointer"
                        >
                          Quick Fill
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Render Full Formatted Email Preview */}
                <div
                  className="rounded-2xl border border-red-950/80 overflow-hidden shadow-md bg-white text-slate-900"
                  dangerouslySetInnerHTML={{ __html: currentEmail.htmlContent }}
                />
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 text-xs">
                No emails sent yet. Submit a registration form to send one.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
