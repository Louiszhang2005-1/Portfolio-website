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
    github: "https://github.com/Louiszhang2005-1/Job-Application-Status-Chrome-Extension",
    links: [{ label: "GitHub", href: "https://github.com/Louiszhang2005-1/Job-Application-Status-Chrome-Extension", kind: "github" }],
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
    github: "https://github.com/Louiszhang2005-1/Latex---resume-converter",
    links: [{ label: "GitHub", href: "https://github.com/Louiszhang2005-1/Latex---resume-converter", kind: "github" }],
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
  { event: "HackHarvard 2026", prize: "1st place, Best Data-Driven Agent", sponsor: "Chalk Prize", project: "Trace", slug: "trace", date: "Oct 2026" },
  { event: "ConUHacks X", prize: "Best Use of ElevenLabs", project: "Nursie", slug: "nursie", date: "Jan 2026" },
  { event: "RoboHacks 2025", prize: "Unexpected Expedition Award", sponsor: "5th overall", project: "Reforestation Robot", slug: "reforestation-robot", date: "Feb 2025" },
];

export const ALSO_COMPETED = [
  { event: "McHacks 13", project: "MechPrep", slug: "mechprep", date: "Jan 2026" },
  { event: "UpStart 2026", project: "ResQ-Link", slug: "resq-link", date: "2026" },
  { event: "Accenture AOTC 2026", project: "CRM Outreach Tool", slug: "crm-outreach-tool", date: "Mar–Apr 2026" },
  { event: "UdemHacks", project: "LazyCare", slug: "lazycare", date: "Mar 2025" },
  { event: "Brebeuf Hacks", project: "Interview Assistant", slug: "interview-assistant", date: "Jan 2024" },
];

export const HONORS = ["Lina & Jean-Guy Gaudreault Perseverance Scholarship"];
