/**
 * The driving world's stops, built on the server from the site's own data so the client
 * bundle never carries portfolio.json. Pure data: positions are world units (metres-ish),
 * north is -z, the camera looks from the south-east.
 */
import { activeProjects, internships } from "@/lib/portfolio";
import { WINS } from "@/components/prototype/projectData";
import { GAME_CONTACT, GAME_INTERNSHIPS } from "@/data/gameContact";

export type StopKind = "internship" | "project" | "win" | "community" | "contact";

export type StopLink = { label: string; href: string };

export type Stop = {
  id: string;
  kind: StopKind;
  /** small uppercase line above the title */
  kicker: string;
  title: string;
  /** one sentence under the title in the proximity card */
  line: string;
  /** primary destination (case study); contact uses `links` instead */
  href: string | null;
  links: StopLink[];
  accent: string;
  /** group used for the project landmark shape */
  group: string;
  /** company logo for internship offices, or the card shown on a community stop's screen (same-origin image) */
  logo: string | null;
  x: number;
  z: number;
};

/** `ground`: painted flat beside its spot (only where nothing stands on it); otherwise it floats above the district */
export type District = { label: string; x: number; z: number; ground?: boolean };

export type WorldData = { stops: Stop[]; districts: District[] };

/** project clusters, in the order their sectors first appear */
const CLUSTERS = [
  { x: 34, z: -4, spread: [[-5, -10], [5, -5], [5, 6], [-5, 11]] },
  { x: -34, z: -4, spread: [[5, -10], [-5, -5], [-5, 6], [5, 11]] },
  { x: 31, z: 27, spread: [[-8, -1], [7, -5], [2, 9], [-12, 11]] },
] as const;

const INTERNSHIP_SPOTS = [
  [-17, -36],
  [0, -42],
  [17, -36],
] as const;

const WIN_SPOTS = [
  [-9, 36],
  [0, 40],
  [9, 36],
] as const;

export function buildWorld(): WorldData {
  const stops: Stop[] = [];
  const districts: District[] = [];

  const jobs = internships.filter((i) => i.status === "active");
  jobs.forEach((job, i) => {
    const spot = INTERNSHIP_SPOTS[i % INTERNSHIP_SPOTS.length];
    const meta = GAME_INTERNSHIPS.find((g) => g.missionId === job.id);
    stops.push({
      id: job.slug,
      kind: "internship",
      kicker: `Internship · ${meta?.when ?? job.date}`,
      title: job.title,
      line: meta?.role ?? job.subtitle,
      href: `/portfolio/${job.slug}`,
      links: [],
      accent: job.accent,
      group: "internship",
      logo: meta?.logo ?? null,
      x: spot[0],
      z: spot[1] - Math.floor(i / INTERNSHIP_SPOTS.length) * 12,
    });
  });
  // Accenture: an apprenticeship in its pro-bono consulting program, next to the internships
  stops.push({
    id: "accenture",
    kind: "internship",
    kicker: "Apprenticeship · Jan.–Apr. 2026",
    title: "Accenture",
    line: "Accent on the Community, Accenture's pro-bono consulting program: our student team built a CRM outreach tool for a community of agriculture startups.",
    href: "/portfolio/crm-outreach-tool",
    links: [],
    accent: "#a100ff",
    group: "internship",
    logo: "/logo/accenture.png",
    x: 34,
    z: -44,
  });
  districts.push({ label: "Internships", x: 0, z: -29 });

  const sectors: string[] = [];
  for (const p of activeProjects) if (!sectors.includes(p.displaySector)) sectors.push(p.displaySector);
  sectors.forEach((sector, si) => {
    const cluster = CLUSTERS[si % CLUSTERS.length];
    const items = activeProjects.filter((p) => p.displaySector === sector);
    districts.push({ label: sector, x: cluster.x, z: cluster.z + (si === 2 ? -8 : 0) });
    items.forEach((p, i) => {
      const off = cluster.spread[i % cluster.spread.length];
      const ring = Math.floor(i / cluster.spread.length);
      stops.push({
        id: p.slug,
        kind: "project",
        kicker: sector,
        title: p.title,
        line: p.subtitle,
        href: `/portfolio/${p.slug}`,
        links: [],
        accent: p.accent,
        group: sector,
        logo: null,
        x: cluster.x + off[0] * (1 + ring * 0.6),
        z: cluster.z + off[1] * (1 + ring * 0.6),
      });
    });
  });

  WINS.forEach((w, i) => {
    const spot = WIN_SPOTS[i % WIN_SPOTS.length];
    stops.push({
      id: `win-${w.slug}`,
      kind: "win",
      kicker: `Hackathon win · ${w.date}`,
      title: w.event,
      line: `${w.prize} · ${w.project}`,
      href: `/portfolio/${w.slug}`,
      links: [],
      accent: "#c9971c",
      group: "win",
      logo: null,
      x: spot[0],
      z: spot[1],
    });
  });
  districts.push({ label: "Hackathon wins", x: 0, z: 29 });

  // community: leadership, judging, speaking, recognition. No case study, so the card links out.
  const COMMUNITY: Omit<Stop, "kind" | "accent" | "group" | "x" | "z" | "href">[] = [
    {
      id: "gdg",
      kicker: "VP Events · Jan.–Apr. 2026",
      title: "Google Developer Group",
      line: "VP Events of the GDG on Campus chapter at Polytechnique Montréal: I plan and run the chapter's events for students.",
      links: [{ label: "Chapter page", href: "https://gdg.community.dev/gdg-on-campus-polytechnique-montreal-montreal-canada/" }],
      logo: "/media/drive/gdg.webp",
    },
    {
      id: "judge-mpc-hacks",
      kicker: "Hackathon judge · May 2026",
      title: "MPC Hacks",
      line: "Judge at a Montréal student hackathon: I evaluated teams' projects and their demos.",
      links: [{ label: "MPC Hacks on Devpost", href: "https://mpchacks.devpost.com/" }],
      logo: "/media/drive/mpc-hacks.webp",
    },
    {
      id: "judge-hack-decouverte",
      kicker: "Hackathon judge · Nov. 2026",
      title: "Hack Découverte",
      line: "Judge at HackConcordia's hackathon for CEGEP and high school students: I evaluated first-time builders' projects.",
      links: [{ label: "HackConcordia", href: "https://www.hackconcordia.io/" }],
      logo: "/media/drive/hack-decouverte.webp",
    },
    {
      id: "speaker-scs",
      kicker: "Guest speaker · Oct. 2026",
      title: "SCS Concordia",
      line: "Talk on landing tech internships, given to 100 students at Concordia's Software Engineering and Computer Science Society.",
      links: [{ label: "SCS Concordia", href: "https://scsconcordia.com/" }],
      logo: "/media/drive/scs-concordia.webp",
    },
    {
      id: "scholarship",
      kicker: "Scholarship · $2,500",
      title: "Perseverance Scholarship",
      line: "Lina & Jean-Guy Gaudreault Perseverance Scholarship from Polytechnique Montréal: $2,500.",
      links: [],
      logo: "/media/drive/scholarship.webp",
    },
    {
      id: "perspective-quebec",
      kicker: "Scholarship · $20,000",
      title: "Bourse Perspective Québec",
      line: "Government of Québec scholarship for students in engineering and other priority fields: $20,000.",
      links: [],
      logo: "/media/drive/perspective-quebec.webp",
    },
  ];
  const COMMUNITY_SPOTS = [
    [-32, -26],
    [-44, -20],
    [-49, -31],
    [-40, -38],
    [-30, -36],
    [-54, -20],
  ] as const;
  COMMUNITY.forEach((c, i) => {
    const spot = COMMUNITY_SPOTS[i % COMMUNITY_SPOTS.length];
    stops.push({ ...c, kind: "community", href: null, accent: "#7b61c9", group: "community", x: spot[0], z: spot[1] });
  });
  districts.push({ label: "Community", x: -38, z: -29 });

  stops.push({
    id: "contact",
    kind: "contact",
    kicker: "Contact",
    title: "Get in touch",
    line: GAME_CONTACT.availability,
    href: null,
    links: [
      { label: "Email", href: `mailto:${GAME_CONTACT.email}` },
      { label: "LinkedIn", href: GAME_CONTACT.linkedin },
      { label: "GitHub", href: GAME_CONTACT.github },
    ],
    accent: "#e4572e",
    group: "contact",
      logo: null,
    x: -28,
    z: 30,
  });

  return { stops, districts };
}
