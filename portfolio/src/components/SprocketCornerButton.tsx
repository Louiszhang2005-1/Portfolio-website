"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import SprocketAvatar from "./SprocketAvatar";
import { GAME_CONTACT, GAME_INTERNSHIPS } from "@/data/gameContact";

interface SprocketCornerButtonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opens the treasure map / project list */
  onOpenProjects: () => void;
  /** Opens a mission blueprint directly by id */
  onInspect: (missionId: string) => void;
}

/**
 * Recruiter quick brief: availability, internships, contact links and a way
 * out to the main site. Opened from the Sprocket corner button or the HUD
 * "Contact" button, so it is reachable at any time without sailing.
 */
export default function SprocketCornerButton({ open, onOpenChange, onOpenProjects, onInspect }: SprocketCornerButtonProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  return (
    <>
      <motion.button
        onClick={() => onOpenChange(!open)}
        className="fixed left-4 top-[calc(env(safe-area-inset-top)+4.75rem)] z-[60] grid h-12 w-12 place-items-center rounded-md border border-cyan-100/35 bg-slate-950/80 shadow-[0_0_24px_rgba(34,211,238,0.28)] backdrop-blur-md md:hidden"
        whileHover={{ scale: 1.08, boxShadow: "0 0 34px rgba(34,211,238,0.48)" }}
        whileTap={{ scale: 0.94 }}
        title="Quick brief & contact"
        aria-label="Open quick brief and contact"
        aria-expanded={open}
      >
        <SprocketAvatar size={38} idle />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sprocket-short"
            role="dialog"
            aria-label="Quick brief and contact"
            className="fixed left-4 right-4 top-[calc(env(safe-area-inset-top)+8.25rem)] z-[95] max-h-[calc(100svh-env(safe-area-inset-top)-9rem)] overflow-y-auto rounded-[8px] border border-cyan-100/25 bg-slate-950/95 p-4 shadow-[0_0_44px_rgba(34,211,238,0.2)] backdrop-blur-md sm:right-auto sm:w-[340px] md:left-auto md:right-4 md:top-16 md:max-h-[calc(100vh-5rem)]"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 440, damping: 24 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <SprocketAvatar size={34} idle />
              <span className="font-label text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/80">
                Quick Brief
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="ml-auto grid h-8 w-8 place-items-center rounded border border-white/15 text-sm text-cyan-50/80 hover:bg-white/10"
                aria-label="Close quick brief"
              >
                ✕
              </button>
            </div>

            <p className="font-headline text-xl font-black text-white">{GAME_CONTACT.name}</p>
            <p className="text-[12px] font-semibold text-cyan-50/80">
              Mechanical Engineering student · Polytechnique Montréal
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200/35 bg-emerald-300/12 px-3 py-1 text-[11px] font-bold text-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {GAME_CONTACT.availability}
            </p>

            <div className="mt-3 space-y-1.5">
              {GAME_INTERNSHIPS.map((item) => (
                <button
                  key={item.title}
                  onClick={() => onInspect(item.missionId)}
                  className="flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] p-2 text-left transition-colors hover:border-cyan-100/40 hover:bg-cyan-100/10"
                >
                  <span className="grid h-8 w-11 shrink-0 place-items-center overflow-hidden rounded bg-white p-1">
                    <img src={item.logo} alt="" className="max-h-full max-w-full object-contain" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-black text-white">{item.title}</span>
                    <span className="block truncate text-[11px] font-semibold text-cyan-50/75">
                      {item.role} · {item.when}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={onOpenProjects}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-300 to-emerald-200 px-3 font-label text-[11px] font-black uppercase tracking-[0.14em] text-slate-950"
            >
              <span className="material-symbols-outlined icon-lock text-[18px]">list</span>
              All projects &amp; internships
            </button>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <ContactLink href={`mailto:${GAME_CONTACT.email}`} icon="mail" label="Email" />
              <ContactLink href={GAME_CONTACT.linkedin} icon="badge" label="LinkedIn" external />
              <ContactLink href={GAME_CONTACT.github} icon="code" label="GitHub" external />
            </div>
            <p className="mt-2 select-all text-center text-[11px] font-semibold text-cyan-50/75">{GAME_CONTACT.email}</p>

            <Link
              href="/"
              className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.06] font-label text-[10px] font-black uppercase tracking-[0.14em] text-white/90 hover:bg-white/12"
            >
              <span className="material-symbols-outlined icon-lock text-[16px]">arrow_back</span>
              Main portfolio site
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ContactLink({ href, icon, label, external }: { href: string; icon: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-cyan-100/25 bg-cyan-300/10 text-[11px] font-black text-cyan-50 hover:bg-cyan-300/20"
    >
      <span className="material-symbols-outlined icon-lock text-[16px]">{icon}</span>
      {label}
    </a>
  );
}
