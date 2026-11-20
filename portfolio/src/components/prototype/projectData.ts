import { projects, type PortfolioItem } from "@/lib/portfolio";

/**
 * Prototype-only project grouping. Lives here (not portfolio.json) so the live site's data stays untouched.
 * Side-project facts come from each repo: Lane from its README, LaTeXify Resume from its backend (main.py).
 */
export const GROUPS = ["Hardware & robotics", "Software & AI", "Side projects"] as const;
export type Group = (typeof GROUPS)[number];

export type ProjectItem = PortfolioItem & {
  group: Group;
  /** drawn visual for projects without a screenshot */
  visual?: "lane" | "latex";
};

// Hardware leads: most target roles are hardware, robotics and manufacturing.
const groupById: Record<string, Group> = {
  "P-1": "Hardware & robotics",
  "P-5": "Hardware & robotics",
  "P-3": "Hardware & robotics",
  "P-4": "Hardware & robotics",
  "P-2": "Hardware & robotics",
  "P-14": "Software & AI",
  "P-11": "Software & AI",
  "P-9": "Software & AI",
  "P-12": "Software & AI",
  "P-13": "Software & AI",
};

/** Real project photos where they exist, instead of a page of the PDF deck (prototype only). */
const thumbnailById: Record<string, string> = {
  "P-1": "/media/csa/prototype-overview.jpg",
  "P-3": "/media/robohacks/robot-held.jpg",
  "P-4": "/media/resq-link/cutaway.jpg", // CAD cutaway from the drawings PDF, not the generated mock-up
  "P-5": "/media/nursie/dashboard.png",
};

/**
 * Wide screenshots shown as a region instead of a centre crop: x, y = top-left as a fraction of the image,
 * w = fraction of the image width that fills the frame. Nursie: rooms 104-105 and the live fall alert.
 */
export const FRAMING: Record<string, { x: number; y: number; w: number }> = {
  "P-5": { x: 0.482, y: 0, w: 0.515 },
};

/**
 * Focal point (CSS object-position) for photos and renders cropped to the 16/10 frame; anything not listed is centred.
 * Reforestation Robot: a portrait shot whose top half is legs, so the frame sits on the breadboard and dispenser.
 * The square app renders lean up so their title bars stay in frame.
 */
export const FOCUS: Record<string, string> = {
  "P-1": "50% 30%",
  "P-3": "50% 62%",
  "P-9": "50% 35%",
  "P-11": "50% 20%",
  "P-12": "50% 15%",
  "P-13": "50% 40%",
};

/** Technical drawings: shown whole on white, never cropped like a photo. */
export const DRAWINGS = new Set(["P-2", "P-4"]);

/** Within each group: strongest engineering first, wins ahead of the rest, then newest first. */
const order = ["P-1", "P-5", "P-3", "P-4", "P-2", "P-14", "P-11", "P-9", "P-12", "P-13"];

const side = (item: Omit<ProjectItem, "status" | "emoji" | "demo" | "image" | "gallery" | "documents" | "accent" | "sortOrder" | "sector">): ProjectItem => ({
  status: "active",
  emoji: "",
  demo: null,
  image: null,
  gallery: [],
  documents: [],
  accent: "var(--accent)",
  sortOrder: 99,
  sector: "Side projects",
  ...item,
});

const sideProjects: ProjectItem[] = [
  side({
    id: "S-1",
    slug: "",
    group: "Side projects",
    visual: "lane",
    title: "Lane",
    subtitle: "Chrome extension",
    displaySector: "Software",
    date: "",
    details:
      "A Chrome extension for keeping internship applications organised across recruitment cycles. It syncs application and rejection emails from Gmail, moves each application through eight statuses from Saved to Offer, shows the whole pipeline as a Sankey chart, and exports any cycle to CSV.",
    skills: ["React", "TypeScript", "Vite", "Recharts", "Chrome MV3", "Gmail OAuth"],
    metrics: ["8 application statuses", "Gmail auto-sync", "CSV import and export"],
    github: "https://github.com/louzhang15/Job-Application-Status-Chrome-Extension",
    links: [{ label: "GitHub", href: "https://github.com/louzhang15/Job-Application-Status-Chrome-Extension", kind: "github" }],
  }),
  side({
    id: "S-2",
    slug: "",
    group: "Side projects",
    visual: "latex",
    title: "LaTeXify Resume",
    subtitle: "Web app",
    displaySector: "Software",
    date: "",
    details:
      "Upload a resume as a PDF or Word file and get it back in Jake's LaTeX template. A FastAPI backend extracts the text, structures it with Gemini, then renders and compiles the LaTeX into a PDF plus the .tex source. Nothing is stored.",
    skills: ["Python", "FastAPI", "Gemini API", "LaTeX", "Jinja", "Next.js", "Docker"],
    metrics: ["2 input formats (PDF, DOCX)", "2 outputs (PDF and .tex)", "0 files stored"],
    github: "https://github.com/louzhang15/Latex---resume-converter",
    links: [{ label: "GitHub", href: "https://github.com/louzhang15/Latex---resume-converter", kind: "github" }],
  }),
];

export const allProjects: ProjectItem[] = [
  ...order
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is PortfolioItem => Boolean(p))
    .map((p) => ({ ...p, group: groupById[p.id], image: thumbnailById[p.id] ?? p.image })),
  ...sideProjects,
];

/** Hackathon results, from the project data already on the site. */
export const WINS = [
  { event: "HackHarvard 2026", prize: "1st place, Best Data-Driven Agent", sponsor: "Chalk Prize", project: "Trace", slug: "trace", date: "Oct. 2026" },
  { event: "ConUHacks X", prize: "Best Use of ElevenLabs", project: "Nursie", slug: "nursie", date: "Jan. 2026" },
  { event: "RoboHacks 2025", prize: "Unexpected Expedition Award", sponsor: "5th overall", project: "Reforestation Robot", slug: "reforestation-robot", date: "Feb. 2025" },
];

/** Other hackathon builds (the CRM tool is listed under Accenture instead). Logos from each event's own site, or from Louis. */
/** `logoBg`: the tile colour behind the logo (dark for light logos, light for dark ones); `bleed`: the logo fills the tile */
export const ALSO_COMPETED: { event: string; project: string; slug: string; date: string; logo?: string; logoBg?: string; bleed?: boolean }[] = [
  { event: "McHacks 13", project: "MechPrep", slug: "mechprep", date: "Jan. 2026", logo: "/logo/mchacks.png" },
  { event: "UpStart 2026", project: "ResQ-Link", slug: "resq-link", date: "Feb. 2026", logo: "/logo/upstart.png", logoBg: "#19223f", bleed: true },
  { event: "UdeMHacks", project: "LazyCare", slug: "lazycare", date: "Mar. 2025", logo: "/logo/udemhacks.png", logoBg: "#000000", bleed: true },
  { event: "BrébeufHx", project: "Interview Assistant", slug: "interview-assistant", date: "Jan. 2024", logo: "/logo/brebeufhx.png" },
];

/**
 * Beyond the wins: from Louis's LinkedIn education entry and his own notes; /game shows the same facts.
 * `logo` is a mark from each organisation's own site; `href` links an entry to its case study.
 */
export type Recognition = {
  /** the role, or the award's name */
  title: string;
  org: string;
  /** date, or the amount for a scholarship */
  meta?: string;
  /** one short sentence on the role */
  detail?: string;
  logo?: string;
  href?: string;
};

/** most recent first */
export const COMMUNITY: Recognition[] = [
  {
    title: "Hackathon judge",
    org: "Hack Découverte · HackConcordia",
    meta: "Nov. 2026",
    detail: "A hackathon for CEGEP and high school students.",
    logo: "/logo/hackconcordia.png",
  },
  {
    title: "Guest speaker",
    org: "SCS Concordia",
    meta: "Oct. 2026",
    detail: "A talk on landing tech internships, to 100 students.",
    logo: "/logo/scs-concordia.png",
  },
  {
    title: "Hackathon judge",
    org: "MPC Hacks",
    meta: "May 2026",
    detail: "Evaluated student teams' projects and demos.",
    logo: "/logo/mpc-hacks.png",
  },
  {
    title: "Apprentice, Accent on the Community",
    org: "Accenture",
    meta: "Jan.–Apr. 2026",
    detail: "Pro-bono consulting program. Our student team built a CRM outreach tool for a community of agriculture startups.",
    logo: "/logo/accenture-mark.png",
    href: "/portfolio/crm-outreach-tool",
  },
  {
    title: "VP Events",
    org: "Google Developer Group on Campus · Polytechnique Montréal",
    meta: "Jan.–Apr. 2026",
    detail: "I plan and run the chapter's events for students.",
    logo: "/logo/gdg.png",
  },
];

export const SCHOLARSHIPS: Recognition[] = [
  {
    title: "Bourse Perspective Québec",
    org: "Government of Québec",
    meta: "$20,000",
    detail: "For students in engineering and other priority fields.",
    logo: "/logo/quebec-mark.png",
  },
  {
    title: "Lina & Jean-Guy Gaudreault Perseverance Scholarship",
    org: "Polytechnique Montréal",
    meta: "$2,500",
    logo: "/logo/polytechnique-mark.png",
  },
];
