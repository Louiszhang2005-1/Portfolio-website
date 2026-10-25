import type { Mission } from "@/data/missions";
import type { Vec2 } from "@/systems/GravitySystem";
import type { StressState } from "@/systems/StressSystem";
import type { HazardState } from "@/systems/HazardZones";

/* Public types for useMatterEngine (the /game physics hook). */

export type GameState = "sailing" | "near_island" | "inspecting" | "docked";

export interface VirtualJoystickInput {
  x: number;
  y: number;
  active: boolean;
}

export interface MatterEngine {
  worldRef: React.RefObject<HTMLDivElement | null>;
  boatHeadingRef: React.RefObject<HTMLDivElement | null>;
  paralaxBgRef: React.RefObject<HTMLDivElement | null>;
  paralaxMidRef: React.RefObject<HTMLDivElement | null>;
  paralaxFgRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: GameState;
  nearbyIsland: Mission | null;
  inspectedIsland: Mission | null;
  visitedIds: Set<string>;
  hudSpeed: number;
  hudHeading: number;
  hudPosition: Vec2;
  hudBoilerPressure: number;
  stressState: StressState;
  hazardState: HazardState;
  trajectoryPoints: Vec2[];
  timeOfDay: number;
  nearestGravityAngle: number;
  fogRevealedZones: Set<number>;
  openBlueprint: () => void;
  /** Open a mission's blueprint directly (quick travel) and sail toward it. */
  inspectMission: (mission: Mission) => void;
  closeBlueprint: () => void;
  navigateToIsland: (mission: Mission) => void;
  returnHome: () => void;
  mapOpen: boolean;
  toggleMap: () => void;
  openMap: () => void;
  closeMap: () => void;
  score: number;
  collectedItems: Set<string>;
  boatSquash: boolean;
  isHullCritical: boolean;
  isBoilerCritical: boolean;
  portShopOpen: boolean;
  openPortShop: () => void;
  closePortShop: () => void;
  repairHull: () => void;
  upgradeThrust: () => void;
  setVirtualJoystickInput: (input: VirtualJoystickInput) => void;
  thrustLevel: number;
  isDocked: boolean;
}
