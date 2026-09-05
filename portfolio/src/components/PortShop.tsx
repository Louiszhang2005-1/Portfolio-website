"use client";

import { AnimatePresence, motion } from "framer-motion";

interface PortShopProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  thrustLevel: number;
  hullStress: number;
  onRepairHull: () => void;
  onUpgradeThrust: () => void;
}

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

export default function PortShop({
  isOpen,
  onClose,
  score,
  thrustLevel,
  hullStress,
  onRepairHull,
  onUpgradeThrust,
}: PortShopProps) {
  const stress = Math.min(100, Math.max(0, Math.round(hullStress)));
  const canRepair = score >= 50 && hullStress > 5;
  const canUpgrade = score >= 100 && thrustLevel < 3;
  const hullHealth = Math.max(0, 100 - stress);
  const enginePct = Math.round((thrustLevel / 3) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="port-bg"
            className="fixed inset-0 z-[95] overflow-hidden bg-[radial-gradient(circle_at_28%_24%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(34,197,94,0.14),transparent_28%),rgba(2,8,22,0.94)] backdrop-blur-[14px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={GRID_STYLE}
            onClick={onClose}
          >
            <div className="absolute inset-0 game-scanline opacity-35" />
            <div className="absolute left-[12%] top-[16%] h-32 w-32 rounded-full border border-cyan-100/10 port-current-ring" />
            <div className="absolute bottom-[12%] right-[18%] h-48 w-48 rounded-full border border-emerald-100/10 port-current-ring port-current-ring--slow" />
          </motion.div>

          <motion.div
            key="port-panel"
            className="fixed inset-0 z-[96] flex items-center justify-center p-3 sm:p-4"
            initial={{ opacity: 0, scale: 0.86, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 310, damping: 25 }}
          >
            <div
              className="relative max-h-[92vh] w-full max-w-[920px] overflow-hidden rounded-lg border border-cyan-100/24 bg-slate-950/92 text-white shadow-[0_0_80px_rgba(34,211,238,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 pointer-events-none opacity-60" style={GRID_STYLE} />
              <div className="absolute inset-0 pointer-events-none game-scanline opacity-35" />

              <header className="relative flex items-center gap-4 border-b border-cyan-100/18 bg-cyan-300/[0.045] px-4 py-4 sm:px-6">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-cyan-100/24 bg-cyan-200/12">
                  <span className="material-symbols-outlined icon-lock text-[30px] text-cyan-100">home_pin</span>
                </div>
                <div className="min-w-0">
                  <p className="font-label text-[9px] font-black uppercase tracking-[0.28em] text-emerald-200/58">
                    Engineering Bay
                  </p>
                  <h2 className="truncate font-headline text-2xl font-black text-white">Home Port</h2>
                </div>
                <div className="ml-auto hidden min-w-[190px] items-center gap-3 rounded-full border border-amber-200/24 bg-amber-300/10 px-4 py-2 sm:flex">
                  <span className="material-symbols-outlined icon-lock text-[20px] text-amber-200">toll</span>
                  <span className="font-headline text-xl font-black text-amber-200">{score}</span>
                  <span className="font-label text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/55">Points</span>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-cyan-100/18 bg-cyan-300/10 text-cyan-100 transition-colors hover:bg-cyan-300/18"
                  aria-label="Close home port"
                >
                  <span className="material-symbols-outlined icon-lock text-[22px]">close</span>
                </button>
              </header>

              <div className="relative grid max-h-[calc(92vh-80px)] gap-5 overflow-y-auto p-4 md:grid-cols-[0.9fr_1.1fr] md:p-6">
                <section className="relative min-h-[320px] overflow-hidden rounded-lg border border-cyan-100/16 bg-cyan-100/[0.035] p-4">
                  <div className="absolute inset-4 rounded-full border border-cyan-100/12 port-radar" />
                  <div className="absolute left-1/2 top-[42%] h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/12 bg-cyan-200/[0.035]" />
                  <motion.div
                    className="absolute left-1/2 top-[42%] grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-100/24 bg-slate-950/70 shadow-[0_0_32px_rgba(34,211,238,0.24)]"
                    animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="material-symbols-outlined icon-lock text-[48px] text-cyan-100">directions_boat</span>
                  </motion.div>
                  <div className="absolute left-6 right-6 bottom-5 grid grid-cols-2 gap-3">
                    <Gauge label="Hull" value={`${hullHealth}%`} bar={hullHealth} tone={stress > 55 ? "#fb7185" : "#67e8f9"} />
                    <Gauge label="Engine" value={`Lv.${thrustLevel}/3`} bar={enginePct} tone="#86efac" />
                  </div>
                </section>

                <section className="grid gap-4 content-start">
                  <div className="flex items-center justify-between rounded-lg border border-amber-200/20 bg-amber-300/10 px-4 py-3 sm:hidden">
                    <span className="font-label text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/55">Points</span>
                    <span className="font-headline text-xl font-black text-amber-200">{score}</span>
                  </div>

                  <ShopAction
                    icon="construction"
                    title="Repair Hull"
                    subtitle="Reduce all FEA zone stress by 50%"
                    meta={`Current stress: ${stress}%`}
                    value={50}
                    enabled={canRepair}
                    tone="#67e8f9"
                    onClick={onRepairHull}
                  />

                  <ShopAction
                    icon="rocket_launch"
                    title="Upgrade Engine"
                    subtitle="+15% thrust power, permanent"
                    meta={`Engine tuning: Lv.${thrustLevel}/3`}
                    value={100}
                    enabled={canUpgrade}
                    tone="#86efac"
                    onClick={onUpgradeThrust}
                    levels={thrustLevel}
                  />

                  <motion.button
                    onClick={onClose}
                    className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-cyan-100/28 bg-gradient-to-r from-cyan-500/65 to-emerald-500/45 px-4 py-3 font-headline text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_0_22px_rgba(34,211,238,0.18)]"
                    whileHover={{ scale: 1.01, boxShadow: "0 0 34px rgba(34,211,238,0.28)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="material-symbols-outlined icon-lock text-[20px]">sailing</span>
                    Set Sail
                  </motion.button>

                  <div className="text-center font-label text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/38">
                    Press <kbd className="mx-1 rounded border border-cyan-100/18 bg-cyan-300/10 px-1.5 py-0.5 text-cyan-100/75">ESC</kbd> to close
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Gauge({ label, value, bar, tone }: { label: string; value: string; bar: number; tone: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-950/72 p-3">
      <div className="flex items-center justify-between">
        <span className="font-label text-[9px] font-black uppercase tracking-[0.18em] text-white/42">{label}</span>
        <span className="font-headline text-sm font-black" style={{ color: tone }}>{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: tone }}
          initial={{ width: 0 }}
          animate={{ width: `${bar}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 20 }}
        />
      </div>
    </div>
  );
}

function ShopAction({
  icon,
  title,
  subtitle,
  meta,
  value,
  enabled,
  tone,
  onClick,
  levels,
}: {
  icon: string;
  title: string;
  subtitle: string;
  meta: string;
  value: number;
  enabled: boolean;
  tone: string;
  onClick: () => void;
  levels?: number;
}) {
  return (
    <motion.div
      className="group rounded-lg border border-cyan-100/14 bg-slate-950/56 p-4 transition-colors hover:border-cyan-100/30 hover:bg-cyan-100/[0.055]"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.055]">
          <span className="material-symbols-outlined icon-lock text-[30px]" style={{ color: tone }}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-headline text-base font-black text-white">{title}</h3>
          <p className="text-xs font-bold text-cyan-100/55">{subtitle}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: tone }}>{meta}</p>
          {typeof levels === "number" && (
            <div className="mt-2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-6 rounded-sm"
                  style={{ background: i < levels ? tone : "rgba(255,255,255,0.12)" }}
                />
              ))}
            </div>
          )}
        </div>
        <motion.button
          onClick={onClick}
          disabled={!enabled}
          className="flex min-w-24 items-center justify-center gap-1.5 rounded-md border px-3 py-2 font-headline text-sm font-black disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            background: enabled ? `linear-gradient(135deg, ${tone}40, rgba(15,23,42,0.45))` : "rgba(255,255,255,0.04)",
            borderColor: enabled ? `${tone}88` : "rgba(255,255,255,0.1)",
            color: enabled ? "#fff" : "rgba(255,255,255,0.45)",
          }}
          whileHover={enabled ? { scale: 1.04 } : {}}
          whileTap={enabled ? { scale: 0.96 } : {}}
        >
          <span className="material-symbols-outlined icon-lock text-[17px]">toll</span>
          {value}
        </motion.button>
      </div>
    </motion.div>
  );
}
