"use client";

import { Mission } from "@/data/missions";
import SprocketAvatar from "./SprocketAvatar";

interface GuideRobotProps {
  nearbyIsland: Mission | null;
  isDocked: boolean;
  mapOpen: boolean;
  gameState: string;
}

export default function GuideRobot({ nearbyIsland, isDocked, mapOpen, gameState }: GuideRobotProps) {
  // The island dialogue already says "press Enter to inspect" — don't stack two prompts.
  if (gameState === "inspecting" || mapOpen || nearbyIsland) return null;

  const message = isDocked
    ? "Home Port is ready. Press Enter to repair or upgrade."
    : "Follow the glowing lanes to an island, or press M for the full project list.";

  return (
    <div className="guide-robot pointer-events-none fixed bottom-32 right-5 z-40 hidden max-w-[260px] items-end gap-3 md:flex">
      <div className="relative mb-3 rounded-lg border border-cyan-100/22 bg-slate-950/80 px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.18)] backdrop-blur-md">
        <div className="absolute -right-2 bottom-4 h-4 w-4 rotate-45 border-r border-t border-cyan-100/22 bg-slate-950/80" />
        <p className="relative m-0 font-label text-[10px] font-black uppercase leading-5 tracking-[0.12em] text-cyan-50/90">
          {message}
        </p>
      </div>
      <SprocketAvatar size={72} idle={!isDocked} />
    </div>
  );
}
