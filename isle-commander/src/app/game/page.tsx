"use client";
/* eslint-disable react-hooks/refs */

import { useMemo, useState, useCallback, useEffect } from "react";
import { useMatterEngine } from "@/hooks/useMatterEngine";
import GameWorld from "@/components/GameWorld";
import ShipRenderer from "@/components/ShipRenderer";
import HUD from "@/components/HUD";
import DialogueBubble from "@/components/DialogueBubble";
import BlueprintModal from "@/components/BlueprintModal";
import MobileControls from "@/components/MobileControls";
import TreasureMap from "@/components/TreasureMap";
import MissionBriefing, { SprocketCornerButton } from "@/components/MissionBriefing";
import PortShop from "@/components/PortShop";
import AssemblyModal from "@/components/AssemblyModal";
import GameChrome from "@/components/GameChrome";
import GuideRobot from "@/components/GuideRobot";

/* Seeded RNG for stable star positions */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const STARS = (() => {
  const rng = seededRng(42);
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: rng() * 100,
    y: rng() * 100,
    size: 1 + rng() * 2,
    delay: rng() * 5,
  }));
})();

export default function Home() {
  const game = useMatterEngine();
  const canvasRef = game.canvasRef;

  // Assembly modal state
  const [assemblyMission, setAssemblyMission] = useState<typeof game.inspectedIsland>(null);
  const [assemblyOpen, setAssemblyOpen] = useState(false);

  const handleCloseAssembly = useCallback(() => {
    setAssemblyOpen(false);
    setAssemblyMission(null);
  }, []);

  const handleAssemblyComplete = useCallback(() => {
    // Assembly passed — could add bonus score here
  }, []);

  const handleMobileInteract = useCallback(() => {
    if (game.isDocked) {
      game.openPortShop();
      return;
    }
    if (game.nearbyIsland) {
      game.openBlueprint();
    }
  }, [game]);

  // Sync canvas buffer size to viewport (avoids SSR/client hydration mismatch)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [canvasRef]);

  // Night cycle
  const nightOpacity = Math.min(1, Math.max(0, game.timeOfDay));
  const isNight = nightOpacity > 0.3;

  const starLayer = useMemo(() => (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 7, opacity: Math.max(0, (nightOpacity - 0.3) / 0.7) }}
    >
      {STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animation: `nightStarTwinkle ${2 + star.delay * 0.6}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  ), [nightOpacity]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none touch-none">

      {/* ── GAME WORLD (with parallax layers) ── */}
      <GameWorld
        worldRef={game.worldRef}
        paralaxBgRef={game.paralaxBgRef}
        paralaxMidRef={game.paralaxMidRef}
        paralaxFgRef={game.paralaxFgRef}
        nearbyIsland={game.nearbyIsland}
        visitedIds={game.visitedIds}
        collectedItems={game.collectedItems}
        fogRevealedZones={game.fogRevealedZones}
        onIslandClick={game.navigateToIsland}
      />

      {/* ── PHYSICS CANVAS (trajectory, gravity fields, hazards) ── */}
      <canvas
        ref={game.canvasRef}
        className="fixed inset-0 pointer-events-none z-[4]"
        width={1920}
        height={1080}
        style={{ width: "100%", height: "100%" }}
      />

      {/* ── DAY / NIGHT CYCLE ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 6,
          background: `radial-gradient(ellipse at center, transparent 15%, rgba(4, 10, 38, ${nightOpacity * 0.72}) 100%)`,
          transition: "background 1s ease",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 6,
          background: `radial-gradient(ellipse at 50% 0%, rgba(0, 200, 255, ${(1 - nightOpacity) * 0.03}) 0%, transparent 60%)`,
          transition: "background 1s ease",
        }}
      />

      {isNight && starLayer}
      <GameChrome />

      {/* ── SHIP ── */}
      <ShipRenderer
        boatHeadingRef={game.boatHeadingRef}
        speed={game.hudSpeed}
        boatSquash={game.boatSquash}
        stressState={game.stressState}
        inHazard={game.hazardState.inThermalZone}
      />

      {/* ── HUD ── */}
      <HUD
        visitedCount={game.visitedIds.size}
        speed={game.hudSpeed}
        boilerPressure={game.hudBoilerPressure}
        stressState={game.stressState}
        nearbyIsland={game.nearbyIsland}
        gameState={game.gameState}
        boatPosition={game.hudPosition}
        boatHeading={game.hudHeading}
        nearestGravityAngle={game.nearestGravityAngle}
        onIslandClick={game.navigateToIsland}
        onToggleMap={game.toggleMap}
        onReturnHome={game.returnHome}
        score={game.score}
        collectedItems={game.collectedItems}
        isHullCritical={game.isHullCritical}
        isBoilerCritical={game.isBoilerCritical}
        isDocked={game.isDocked}
      />

      {/* ── DIALOGUE ── */}
      {game.gameState !== "inspecting" && (
        <DialogueBubble
          nearbyIsland={game.nearbyIsland}
          onInspect={game.openBlueprint}
        />
      )}

      <GuideRobot
        nearbyIsland={game.nearbyIsland}
        isDocked={game.isDocked}
        mapOpen={game.mapOpen}
        gameState={game.gameState}
      />

      {/* ── BLUEPRINT MODAL ── */}
      <BlueprintModal
        mission={game.inspectedIsland}
        isOpen={game.gameState === "inspecting"}
        onClose={game.closeBlueprint}
      />

      {/* ── ASSEMBLY MODAL ── */}
      <AssemblyModal
        mission={assemblyMission}
        isOpen={assemblyOpen}
        onClose={handleCloseAssembly}
        onComplete={handleAssemblyComplete}
      />

      {/* ── PORT SHOP ── */}
      <PortShop
        isOpen={game.portShopOpen}
        onClose={game.closePortShop}
        score={game.score}
        thrustLevel={game.thrustLevel}
        hullStress={game.stressState.totalStress}
        onRepairHull={game.repairHull}
        onUpgradeThrust={game.upgradeThrust}
      />

      {/* ── TREASURE MAP ── */}
      <TreasureMap
        isOpen={game.mapOpen}
        onClose={game.closeMap}
        visitedIds={game.visitedIds}
        onNavigate={game.navigateToIsland}
        boatPosition={game.hudPosition}
        boatHeading={game.hudHeading}
      />

      {/* ── MOBILE CONTROLS ── */}
      <MobileControls
        onJoystickChange={game.setVirtualJoystickInput}
        onMap={game.toggleMap}
        onReturnHome={game.returnHome}
        onInteract={handleMobileInteract}
        canInteract={Boolean(game.nearbyIsland)}
        isDocked={game.isDocked}
        nearbyLabel={game.nearbyIsland?.title}
      />

      {/* ── MISSION BRIEFING (onboarding) ── */}
      <MissionBriefing />
      <SprocketCornerButton />
    </div>
  );
}
