import { useState } from "react";
import { Award, Download, Printer, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

export default function Certificates() {
  const [recipient, setRecipient] = useState("Alex Rivera");
  const [hackathonTitle, setHackathonTitle] = useState("TechFest Sri Lanka 2026");
  const [certType, setCertType] = useState("Winner - 1st Place");
  const [certId, setCertId] = useState("HF-2026-98421");
  const [issueDate, setIssueDate] = useState("October 17, 2026");

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  const handlePrint = () => {
    triggerConfetti();
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Certificates & Credential Verification
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Generate, issue, and verify digitally signed certificates of achievement and participation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerConfetti}
            className="flex items-center gap-2 px-4 py-2 bg-red-950/60 text-orange-300 hover:bg-red-900/60 rounded-xl text-xs font-bold transition border border-red-900/40 cursor-pointer"
          >
            <Sparkles size={15} /> Celebrate
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition cursor-pointer"
          >
            <Printer size={15} /> Print Certificate
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-[#120c0b] border border-red-950/80 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base pb-3 border-b border-red-950/60 flex items-center gap-2">
            <Award size={18} className="text-orange-500" /> Certificate Customization
          </h3>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Recipient Full Name
            </label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Hackathon Competition
            </label>
            <input
              value={hackathonTitle}
              onChange={(e) => setHackathonTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Award Title / Type
            </label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option className="bg-[#1c1211] text-zinc-100">Winner - 1st Place Grand Champion</option>
              <option className="bg-[#1c1211] text-zinc-100">Runner Up - 2nd Place</option>
              <option className="bg-[#1c1211] text-zinc-100">Best Technical Innovation</option>
              <option className="bg-[#1c1211] text-zinc-100">Certificate of Completion & Participation</option>
              <option className="bg-[#1c1211] text-zinc-100">Distinguished Hackathon Mentor</option>
              <option className="bg-[#1c1211] text-zinc-100">Honorable Judge Recognition</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Issue Date
            </label>
            <input
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="pt-3 border-t border-red-950/60 flex items-center justify-between text-xs text-zinc-400">
            <span>Certificate UID:</span>
            <span className="font-mono font-bold text-orange-400">{certId}</span>
          </div>
        </div>

        {/* Certificate Visual Preview Canvas */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#170e0d] via-[#120c0b] to-[#1e100e] p-6 sm:p-10 rounded-3xl border-4 border-orange-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between text-center min-h-[460px]">
          {/* Subtle Decorative Guilloche border corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-orange-500/80" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-orange-500/80" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-orange-500/80" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-orange-500/80" />

          {/* Top Banner */}
          <div>
            <div className="w-14 h-14 bg-gradient-to-tr from-red-600 to-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-950/80 border border-orange-400/40">
              <Award size={32} />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-amber-400 block">
              Official Certificate of Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif italic text-white mt-1">
              HackFlow AI Innovation Guild
            </h2>
          </div>

          {/* Recipient Details */}
          <div className="my-6 space-y-2">
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
              This credential is proud to certify that
            </p>

            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-amber-300 underline decoration-orange-500 decoration-2 underline-offset-8">
              {recipient || "Recipient Name"}
            </div>

            <p className="text-xs text-zinc-300 max-w-lg mx-auto pt-2 leading-relaxed">
              has achieved distinction in recognition of exemplary design, technical prowess, and innovative problem solving in
            </p>

            <h3 className="text-lg sm:text-xl font-bold text-white">
              {hackathonTitle}
            </h3>

            <div className="inline-block px-4 py-1.5 rounded-full bg-red-950/80 border border-orange-500/40 text-orange-300 text-xs font-bold mt-2">
              {certType}
            </div>
          </div>

          {/* Bottom Verification & Signatures */}
          <div className="pt-6 border-t border-red-950/60 grid grid-cols-2 sm:grid-cols-3 gap-4 items-end text-xs text-zinc-400">
            <div className="text-left">
              <span className="font-bold block text-white">John Doe</span>
              <span className="text-[10px] text-zinc-500">Lead Hackathon Organizer</span>
              <div className="w-24 h-0.5 bg-red-900/60 mt-1" />
            </div>

            <div className="hidden sm:block text-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-orange-500/60 flex items-center justify-center mx-auto text-[10px] font-bold text-amber-300">
                SEAL
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 block">Verified Credential</span>
            </div>

            <div className="text-right">
              <span className="font-bold block text-white">{issueDate}</span>
              <span className="text-[10px] text-zinc-500">UID: {certId}</span>
              <div className="w-24 h-0.5 bg-red-900/60 mt-1 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
