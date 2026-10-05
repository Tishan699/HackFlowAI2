export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = "bg-red-950/50 text-orange-400 border border-red-800/40",
}) {
  return (
    <div className="bg-[#120c0b] border border-red-950/60 hover:border-orange-500/40 rounded-2xl p-5 shadow-lg shadow-black/40 hover:shadow-red-950/30 transition-all duration-300 group relative overflow-hidden">
      {/* Subtle top ember glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</p>
          <h2 className="text-3xl font-black text-white mt-2 tracking-tight font-heading group-hover:text-orange-200 transition">
            {value}
          </h2>
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md ${iconBg}`}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
