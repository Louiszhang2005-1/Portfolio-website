"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mission } from "@/data/missions";

interface BlueprintModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
}

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

export default function BlueprintModal({ mission, isOpen, onClose }: BlueprintModalProps) {
  const mediaItems = useMemo(() => {
    if (!mission) return [];

    const sources =
      mission.images && mission.images.length > 0
        ? mission.images
        : mission.image
          ? [mission.image]
          : mission.logo
            ? [mission.logo]
            : [];

    return sources.map((src, index) => ({
      src,
      label:
        mission.imageLabels?.[index] ??
        (index === 0 ? (mission.image ? "Field Photo" : "Identity Mark") : `Media ${index + 1}`),
    }));
  }, [mission]);

  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  if (!mission) return null;

  const parts = mission.assemblyParts?.slice(0, 6) ?? [];
  const hasParts = parts.length > 0;
  const moduleCount = Math.max(mission.skills.length, parts.length || 1);
  const activeMedia = mediaItems.find((item) => item.src === selectedMedia) ?? mediaItems[0];
  const mediaSrc = activeMedia?.src;
  const mediaLabel = activeMedia?.label ?? "Schematic";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="blueprint-backdrop"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-0 z-[100] overflow-hidden bg-[radial-gradient(circle_at_24%_18%,rgba(34,211,238,0.2),transparent_32%),radial-gradient(circle_at_82%_24%,rgba(250,204,21,0.12),transparent_25%),linear-gradient(135deg,rgba(2,8,22,0.97),rgba(4,14,32,0.97))] backdrop-blur-[14px]"
            style={GRID_STYLE}
            onClick={onClose}
          >
            <div className="absolute inset-0 game-scanline opacity-35" />
            <div className="absolute left-[7%] top-[18%] h-52 w-52 rounded-full border border-cyan-100/10 blueprint-orbit" />
            <div className="absolute bottom-[10%] right-[9%] h-64 w-64 rounded-full border border-cyan-100/10 blueprint-orbit blueprint-orbit--slow" />
          </motion.div>

          <motion.div
            key="blueprint-scanline"
            className="pointer-events-none fixed left-0 right-0 z-[101] h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-50"
            initial={{ top: 0 }}
            animate={{ top: "100vh" }}
            transition={{ duration: 2.3, ease: "linear", repeat: Infinity }}
          />

          <motion.div
            key="blueprint-modal"
            initial={{ opacity: 0, scale: 0.72, y: 34, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.88, y: 20, filter: "blur(5px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed inset-0 z-[102] flex items-center justify-center p-3 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="launch-panel relative max-h-[92vh] w-full max-w-[1040px] overflow-hidden rounded-lg border border-cyan-100/24 bg-slate-950/93 text-white shadow-[0_0_90px_rgba(34,211,238,0.2)]">
              <div className="pointer-events-none absolute inset-0 opacity-60" style={GRID_STYLE} />
              <div className="pointer-events-none absolute inset-0 game-scanline opacity-35" />

              <header className="relative border-b border-cyan-100/18 bg-cyan-300/[0.045] p-4 sm:p-6">
                <div className="absolute right-16 top-3 hidden rotate-12 rounded-sm border-2 border-amber-300 px-3 py-1 font-label text-[10px] font-black uppercase tracking-[0.18em] text-amber-200 sm:block">
                  Verified
                </div>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-md border border-cyan-100/18 bg-cyan-300/10 text-cyan-100 transition-colors hover:bg-cyan-300/18"
                  aria-label="Close mission briefing"
                >
                  <span className="material-symbols-outlined icon-lock text-[22px]">close</span>
                </button>

                <div className="flex gap-4 pr-12">
                  <motion.div
                    className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-cyan-100/22 bg-cyan-200/[0.075]"
                    animate={{ y: [-2, 2, -2], rotate: [-1.5, 1.5, -1.5] }}
                    transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="absolute inset-0 blueprint-crosshair opacity-60" />
                    {mission.logo ? (
                      <img src={mission.logo} alt={`${mission.title} logo`} className="relative max-h-14 max-w-16 rounded bg-white/95 object-contain p-1" />
                    ) : (
                      <span className="material-symbols-outlined icon-lock relative text-[46px] text-cyan-100">precision_manufacturing</span>
                    )}
                  </motion.div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-cyan-100/24 bg-cyan-300/12 px-2 py-1 font-label text-xs font-black text-cyan-100">
                        {mission.id}
                      </span>
                      <span className="font-label text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/55">
                        {mission.sector}
                      </span>
                    </div>
                    <h2 className="font-headline text-2xl font-black leading-tight text-white sm:text-4xl">
                      {mission.title}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm font-bold text-cyan-100/55 sm:text-base">{mission.subtitle}</p>
                  </div>
                </div>
              </header>

              <div className="relative grid max-h-[calc(92vh-142px)] gap-5 overflow-y-auto p-4 lg:grid-cols-[360px_1fr] lg:p-6">
                <section className="grid gap-4 content-start">
                  {mediaSrc && (
                    <motion.div
                      className="relative aspect-[16/10] overflow-hidden rounded-lg border border-cyan-100/18 bg-slate-950/72"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 }}
                    >
                      <img
                        src={mediaSrc}
                        alt={`${mission.title} ${mediaLabel.toLowerCase()}`}
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.62))]" />
                      <div className="absolute inset-0 pointer-events-none game-scanline opacity-30" />
                      <div className="absolute left-3 top-3 rounded-md border border-cyan-100/20 bg-slate-950/74 px-2 py-1 font-label text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/72">
                        {mediaLabel}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.85)]" />
                        <span className="truncate font-label text-[10px] font-black uppercase tracking-[0.16em] text-white/76">
                          {mission.title}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {mediaItems.length > 1 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {mediaItems.map((item) => {
                        const isSelected = item.src === mediaSrc;
                        return (
                          <button
                            key={item.src}
                            type="button"
                            onClick={() => setSelectedMedia(item.src)}
                            className={`group overflow-hidden rounded-md border bg-slate-950/66 text-left transition-all ${
                              isSelected
                                ? "border-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.24)]"
                                : "border-cyan-100/14 hover:border-cyan-100/36"
                            }`}
                            aria-pressed={isSelected}
                          >
                            <span className="relative block aspect-[16/10] bg-slate-950">
                              <img src={item.src} alt={`${mission.title} ${item.label}`} className="h-full w-full object-cover opacity-86 transition-transform duration-300 group-hover:scale-[1.035]" />
                              <span className="absolute inset-0 bg-gradient-to-t from-slate-950/76 via-transparent to-transparent" />
                            </span>
                            <span className="block truncate px-2 py-1.5 font-label text-[9px] font-black uppercase tracking-[0.12em] text-cyan-50/72">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="relative min-h-[260px] overflow-hidden rounded-lg border border-cyan-100/16 bg-cyan-100/[0.035] p-4">
                    <div className="absolute inset-5 rounded-full border border-cyan-100/14 blueprint-orbit" />
                    <div className="absolute left-1/2 top-[43%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/18 bg-slate-950/62" />
                    <div className="absolute left-1/2 top-[43%] grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md border border-cyan-100/26 bg-cyan-200/12 shadow-[0_0_28px_rgba(34,211,238,0.24)]">
                      <span className="material-symbols-outlined icon-lock text-[42px] text-cyan-100">deployed_code</span>
                    </div>
                    {hasParts ? (
                      parts.map((part, index) => {
                        const x = 50 + Math.max(-38, Math.min(38, part.targetX / 1.8));
                        const y = 43 + Math.max(-30, Math.min(30, part.targetY / 1.8));
                        return (
                          <motion.div
                            key={part.id}
                            className="absolute h-3 w-3 rounded-full border border-white/50 shadow-[0_0_14px_rgba(125,252,255,0.8)]"
                            style={{ left: `${x}%`, top: `${y}%`, background: part.color }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.12 + index * 0.08, type: "spring", stiffness: 320, damping: 18 }}
                            title={part.label}
                          />
                        );
                      })
                    ) : (
                      <div className="absolute inset-x-6 bottom-6 text-center font-label text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/38">
                        Schematic signal locked to mission profile
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DataTile label="Mission Code" value={mission.id} />
                    <DataTile label="Sector" value={mission.sector} />
                    <DataTile label="Systems" value={`${moduleCount} modules`} />
                    <DataTile label="Media" value={mediaSrc ? "ATTACHED" : "MISSING"} highlight={Boolean(mediaSrc)} />
                  </div>
                </section>

                <section className="grid gap-5 content-start">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-label text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/55">
                      <span className="material-symbols-outlined icon-lock text-[17px]">manufacturing</span>
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mission.skills.map((skill, i) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 + i * 0.035 }}
                          className="rounded-full border border-cyan-100/24 bg-cyan-300/10 px-3 py-1.5 font-label text-xs font-black text-cyan-100 transition-colors hover:bg-cyan-300/18"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-cyan-100/16" />

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-label text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/55">
                      <span className="material-symbols-outlined icon-lock text-[17px]">article</span>
                      Mission Brief
                    </h3>
                    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/24 p-4">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent blueprint-scan" />
                      <p className="text-sm font-semibold leading-7 text-cyan-50/84 sm:text-base whitespace-pre-line">{mission.details}</p>
                    </div>
                  </div>

                  {hasParts && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-label text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/55">
                        <span className="material-symbols-outlined icon-lock text-[17px]">account_tree</span>
                        Assembly Nodes
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {parts.map((part) => (
                          <div key={part.id} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] p-2">
                            <span className="h-3 w-3 rounded-full" style={{ background: part.color }} />
                            <span className="truncate font-label text-[11px] font-black text-cyan-50/78">{part.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mission.resources && mission.resources.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-label text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/55">
                        <span className="material-symbols-outlined icon-lock text-[17px]">folder_open</span>
                        Mission Resources
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {mission.resources.map((resource) => (
                          <ActionLink
                            key={resource.href}
                            href={resource.href}
                            icon={resource.icon ?? "description"}
                            label={resource.label}
                            emptyLabel="Missing"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ActionLink href={mission.github} icon="code" label="GitHub" emptyLabel="Classified" />
                    <ActionLink href={mission.demo} icon="rocket_launch" label="Live Demo" emptyLabel="Coming Soon" />
                  </div>

                  <motion.button
                    onClick={onClose}
                    className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-cyan-100/28 bg-gradient-to-r from-cyan-500/65 to-emerald-500/45 px-4 py-3 font-headline text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_0_22px_rgba(34,211,238,0.18)]"
                    whileHover={{ scale: 1.01, boxShadow: "0 0 34px rgba(34,211,238,0.28)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="material-symbols-outlined icon-lock text-[20px]">keyboard_return</span>
                    Return to Ship
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

function DataTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-950/58 p-3">
      <div className="font-label text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/38">{label}</div>
      <div className="mt-1 truncate font-headline text-sm font-black" style={{ color: highlight ? "#86efac" : "#dff9ff" }}>
        {value}
      </div>
    </div>
  );
}

function ActionLink({ href, icon, label, emptyLabel }: { href?: string; icon: string; label: string; emptyLabel: string }) {
  if (!href) {
    return (
      <div className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-4 py-3 font-headline text-sm font-black text-white/28">
        <span className="material-symbols-outlined icon-lock text-[18px]">lock</span>
        {emptyLabel}
      </div>
    );
  }

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-cyan-100/24 bg-cyan-300/10 px-4 py-3 font-headline text-sm font-black text-cyan-100"
      whileHover={{ scale: 1.02, backgroundColor: "rgba(103,232,249,0.16)" }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="material-symbols-outlined icon-lock text-[18px]">{icon}</span>
      {label}
    </motion.a>
  );
}
