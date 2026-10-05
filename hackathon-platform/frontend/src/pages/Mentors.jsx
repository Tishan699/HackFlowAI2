import { useState, useEffect } from "react";
import { GraduationCap, Calendar, Clock, CheckCircle2, MessageSquare, X } from "lucide-react";
import { hackathonService } from "../services/api";

export default function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [teamName, setTeamName] = useState("NeuralNinjas");
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    const list = await hackathonService.getMentors();
    setMentors(list);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    await hackathonService.bookMentorSession(selectedMentor.id, selectedSlot, teamName);
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setSelectedMentor(null);
      setSelectedSlot("");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Mentors & Advisory Network
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Connect with industry experts, book 1-on-1 architecture reviews, and unblock your project.
          </p>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {mentors.map((m) => (
          <div
            key={m.id}
            className="bg-[#120c0b] border border-red-950/80 hover:border-orange-500/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-orange-300 transition-colors">{m.name}</h3>
                  <span className="text-xs text-orange-400 font-semibold">{m.company}</span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    m.availability === "Available Now"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                      : "bg-amber-950/60 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {m.availability}
                </span>
              </div>

              <div className="mt-4 p-3 bg-[#170e0d] border border-red-950/60 rounded-xl text-xs space-y-1">
                <span className="text-zinc-500 font-medium block">Specialty:</span>
                <span className="text-amber-300 font-bold">{m.specialty}</span>
              </div>

              <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                {m.bio}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-red-950/60">
              <button
                onClick={() => {
                  setSelectedMentor(m);
                  setSelectedSlot(m.slots?.[0] || "");
                }}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-red-950/60 border border-orange-400/30 cursor-pointer"
              >
                <Calendar size={14} /> Book 1-on-1 Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#120c0b] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-900/60 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-red-950/60">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Book Session with {selectedMentor.name}
                </h3>
                <span className="text-xs text-orange-400 font-medium">{selectedMentor.company}</span>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {booked ? (
              <div className="py-8 text-center bg-emerald-950/40 border border-emerald-500/30 rounded-2xl my-4">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-300 text-base">Mentorship Session Confirmed!</h4>
                <p className="text-xs text-emerald-400/80 mt-1">Calendar invite sent to your team email.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Your Team Name
                  </label>
                  <input
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Select Available Time Slot
                  </label>
                  <div className="space-y-2">
                    {selectedMentor.slots?.map((slot, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                          selectedSlot === slot
                            ? "bg-red-950/60 border-orange-500 text-amber-300 font-bold"
                            : "bg-[#170e0d] border-red-950/60 text-zinc-300 hover:bg-[#1c1211]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="slot"
                          checked={selectedSlot === slot}
                          onChange={() => setSelectedSlot(slot)}
                          className="accent-orange-500"
                        />
                        <Clock size={14} className="text-orange-400" />
                        <span>{slot}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-red-950/60">
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
