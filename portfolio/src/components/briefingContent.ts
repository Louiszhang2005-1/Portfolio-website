import { missions } from "@/data/missions";
import { GAME_CONTACT, GAME_INTERNSHIPS } from "@/data/gameContact";

/* Copy for the /game onboarding briefing (MissionBriefing). Claims here must
   match src/data/missions.ts and src/data/portfolio.json. */

export type Line = { text: string; color?: string; indent?: boolean; tag?: string; tagColor?: string };
export type Phase = "booting" | "part1" | "part2" | "part3" | "outro" | "closed";

export const PHASES: Phase[] = ["booting", "part1", "part2", "part3", "outro", "closed"];

export const PHASE_LABELS: Record<string, string> = {
  booting: "PROFILE LINK",
  part1: "IDENTITY",
  part2: "HIGHLIGHTS",
  part3: "CONTROLS",
};

const SUB = "rgba(214,240,255,0.86)";
const KEY = "rgba(125,240,240,0.95)";

const PART1_LINES: Line[] = [
  { text: "Identity confirmed: Louis Zhang." },
  { text: "Mechanical engineering student building across hardware, manufacturing, aerospace, robotics, and software." },
  { text: `${GAME_CONTACT.availability}.`, color: "#a7f3d0" },
  { text: "The internship route runs City of Montréal → Lockheed Martin → Tesla." },
  { text: "Sail between islands to open each project's blueprint, or press M for the full project list." },
];

const PART2_LINES: Line[] = [
  { text: "Signal highlights loaded:" },
  { text: "> Tesla", tag: "LFP Cell Engineering", tagColor: "#dc2626" },
  { text: "Manufacturing Engineering Intern: cell production processes, PLC/HMI controls, equipment design, root-cause analysis.", color: SUB, indent: true },
  { text: "> Lockheed Martin", tag: "Ship Integration", tagColor: "#1d4ed8" },
  { text: "Mechanical Engineering Intern: SolidWorks CAD and structural design of ship compartment components, VBA review automation.", color: SUB, indent: true },
  { text: "> City of Montréal", tag: "Water Testing", tagColor: "#0277bd" },
  { text: "Engineering Intern: water quality monitoring and geospatial data pipelines.", color: SUB, indent: true },
  { text: "> Lunar Transport System", tag: "Systems", tagColor: "#b45309" },
  { text: "PM & systems integrator for a lunar produce-transport prototype: CATIA / Fusion 360 analysis, Arduino controls.", color: SUB, indent: true },
  { text: "> Hackathon wins", tag: "Awards", tagColor: "#059669" },
  { text: "HackHarvard 2026 1st place (Chalk Prize) · ConUHacks X Best Use of ElevenLabs · RoboHacks Unexpected Expedition Award.", color: SUB, indent: true },
];

const PART3_LINES: Line[] = [
  { text: "Controls:" },
  { text: "WASD / Arrows - Thrust & steer", color: KEY, indent: true },
  { text: "Touch - On-screen helm (bottom left)", color: KEY, indent: true },
  { text: "ENTER - Inspect island / dock at Home Port", color: KEY, indent: true },
  { text: "M - Treasure map + project list (quick travel)", color: KEY, indent: true },
  { text: "ESC - Close panels", color: KEY, indent: true },
  { text: "Optional: collect Perseverance Points, avoid thermal vents, and upgrade at Home Port." },
];

export const PHASE_LINES: Record<string, Line[]> = {
  part1: PART1_LINES,
  part2: PART2_LINES,
  part3: PART3_LINES,
};

/* Chronological for the briefing sidebar */
export const INTERNSHIP_TIMELINE = [...GAME_INTERNSHIPS].reverse();

const activeMissions = missions.filter((m) => m.status === "active");
const internshipCount = activeMissions.filter((m) => m.sector === "Internship Shores").length;

export const PLAY_SIGNALS = [
  { label: "Internships", value: String(internshipCount), color: "#67e8f9" },
  { label: "Projects", value: String(activeMissions.length - internshipCount), color: "#86efac" },
  { label: "Available", value: "2027", color: "#fde68a" },
];

export const COMMAND_CARDS = [
  { icon: "directions_boat", label: "Sail", hint: "WASD" },
  { icon: "radar", label: "Inspect", hint: "ENTER" },
  { icon: "map", label: "Project list", hint: "M" },
  { icon: "gamepad", label: "Touch Helm", hint: "MOBILE" },
];

export const RADAR_BLIPS = [
  { x: 24, y: 31, label: "75" },
  { x: 62, y: 24, label: "65" },
  { x: 72, y: 58, label: "82" },
  { x: 38, y: 71, label: "51" },
  { x: 52, y: 47, label: "68" },
];
