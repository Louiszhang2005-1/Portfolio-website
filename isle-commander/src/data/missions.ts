/* ─── Assembly Part type for the Mini-Game ─── */
export interface AssemblyPart {
  id: string;
  label: string;
  shape: "rect" | "circle" | "polygon";
  width: number;
  height: number;
  mass: number;
  color: string;
  targetX: number; // blueprint-relative placement target
  targetY: number;
  targetAngle?: number;
}

export interface MissionResource {
  label: string;
  href: string;
  icon?: string;
}

export interface Mission {
  id: string;
  sector: string;
  sectorColor: string;
  title: string;
  subtitle: string;
  status: "locked" | "active";
  landmark: string;
  position: { x: number; y: number };
  /** Display date for the mission badge (null for locked / unknown). */
  date: string | null;
  /** Chronological sort key (YYYYMM); used to order in-sector paths. Null for locked. */
  chronoOrder: number | null;
  skills: string[];
  details: string;
  emoji: string;
  color: string;
  logo?: string;
  image?: string;
  images?: string[];
  imageLabels?: string[];
  github?: string;
  demo?: string;
  resources?: MissionResource[];
  /* Physics properties */
  gravityMass: number;         // Gravitational pull strength (400-1200)
  fieldType: "typhoon" | "gravity";  // Visual field effect type
  fieldRadius?: number;        // Override default field radius (default ~250)
  assemblyParts?: AssemblyPart[]; // For assembly mini-game
}

export const missions: Mission[] = [
  // ═══════════════════════════════════════════════════
  // ⚡ INTERNSHIP SHORES (Northwest) — Work experience
  // ═══════════════════════════════════════════════════
  {
    id: "I-4",
    sector: "Internship Shores",
    sectorColor: "#e65100",
    title: "City of Montreal",
    subtitle: "Scientific Intern · Water Testing · May–Aug 2025",
    status: "active",
    landmark: "A waterfront city hall with municipal water-testing labs and bubbling sample beakers",
    position: { x: -560, y: -420 },
    date: "May–Aug 2025",
    chronoOrder: 202505,
    skills: [],
    details:
      "Scientific Intern at the City of Montreal's Water Department (May–Aug 2025). Performed hands-on water testing across municipal sources — collected and analyzed samples for chemical, physical, and microbiological parameters to validate compliance with Quebec drinking-water standards. Operated lab instrumentation, logged results into the city's monitoring pipelines, and supported the data analysis workflow that informs distribution-network decisions.",
    emoji: "💧",
    color: "#0277bd",
    logo: "/logo/city-of-montreal.gif",
    image: "/logo/city-of-montreal.gif",
    gravityMass: 600,
    fieldType: "typhoon",
    fieldRadius: 220,
  },
  {
    id: "I-2",
    sector: "Internship Shores",
    sectorColor: "#e65100",
    title: "Lockheed Martin",
    subtitle: "Mechanical Engineering Intern · Ship Integration · Jan – Apr 2026",
    status: "active",
    landmark: "A naval shipyard with a docked frigate, gantry cranes, and integration scaffolding",
    position: { x: -1050, y: -760 },
    date: "Jan – Apr 2026",
    chronoOrder: 202601,
    skills: ["Ship Systems Integration", "3D CAD Modeling", "Mechanical Design", "GD&T", "FEA", "CATIA"],
    details:
      "Mechanical Engineering Intern at Lockheed Martin on the Ship Integration team (Jan – Apr 2026). Supported the mechanical integration of subsystems aboard naval platforms — 3D CAD modeling, structural layouts, fit-checks, and tolerance/GD&T documentation for shipboard hardware. Worked on FEA validation for mounting structures and contributed to the assembly drawings and interface documentation that govern how subsystems are physically integrated into the ship.",
    emoji: "⚓",
    color: "#1a3a6b",
    logo: "/logo/lockheed-martin.jpg",
    gravityMass: 800,
    fieldType: "gravity",
    fieldRadius: 260,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_GJnyIpTNceIUOUaWKj2yA16tfchlN9cYnadcCbuuuZQ5C4-ApDELnIMFMUoAHG9X95DjBR0_DOWKFyWrnpLzzkYA_ei38IBp2Hlz5fDKhUtgq2N7rNXSRrE3fph1Wu9M2Ogv3dhZ3hh3294kM9omBYp77--auHbaBqrZcIkiQ_mOt3kqOxAzfHs47wzpJ9xKaSCebvpm5kKiuPAHq5gwhK8PUaH620g3qSJPop9HsHZ1As5-jYosi5FEppzMGh3U5pJmiZucRqPE",
  },
  {
    id: "I-1",
    sector: "Internship Shores",
    sectorColor: "#e65100",
    title: "Tesla",
    subtitle: "Manufacturing Engineering Intern · Cell Engineering · Jun 2026 – Jan 2027",
    status: "active",
    landmark: "A massive gigafactory with electric arcs and battery cell assembly lines",
    position: { x: -1500, y: -1180 },
    date: "Jun 2026 – Jan 2027 · Incoming",
    chronoOrder: 202607,
    skills: [],
    details:
      "Incoming Manufacturing Engineering Intern at Tesla on the Cell Engineering team (Jun 2026 – Jan 2027, Nevada Gigafactory). Will work on the manufacturing processes behind Tesla's battery cells — production-line optimization, process improvement, and automation systems supporting next-generation cell architectures and high-volume cell output.",
    emoji: "⚡",
    color: "#e65100",
    logo: "/logo/tesla.jpg",
    gravityMass: 1000,
    fieldType: "typhoon",
    fieldRadius: 280,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_GJnyIpTNceIUOUaWKj2yA16tfchlN9cYnadcCbuuuZQ5C4-ApDELnIMFMUoAHG9X95DjBR0_DOWKFyWrnpLzzkYA_ei38IBp2Hlz5fDKhUtgq2N7rNXSRrE3fph1Wu9M2Ogv3dhZ3hh3294kM9omBYp77--auHbaBqrZcIkiQ_mOt3kqOxAzfHs47wzpJ9xKaSCebvpm5kKiuPAHq5gwhK8PUaH620g3qSJPop9HsHZ1As5-jYosi5FEppzMGh3U5pJmiZucRqPE",
  },
  // ── Internship: classified slot (locked) ──
  {
    id: "I-3",
    sector: "Internship Shores",
    sectorColor: "#e65100",
    title: "Classified",
    subtitle: "Secret Mission",
    status: "locked",
    landmark: "A black monolith with a pulsing question mark beacon",
    position: { x: -1540, y: -430 },
    date: null,
    chronoOrder: null,
    skills: [],
    details: "Classified — mission briefing not yet available. Stay curious.",
    emoji: "❓",
    color: "#e65100",
    gravityMass: 400,
    fieldType: "gravity",
    fieldRadius: 200,
  },

  // ═══════════════════════════════════════════════════
  // 🚀 Aero Atoll (Northeast) — Aerospace & Mechanical
  // ═══════════════════════════════════════════════════
  {
    id: "P-1",
    sector: "Aero Atoll",
    sectorColor: "#b8860b",
    title: "CSA Transport System",
    subtitle: "CSA LEAP · Vegetable Collection Transport System · Jan–May 2025 · Polytechnique Montréal",
    status: "active",
    landmark: "A miniature moon-base with a moving lunar wagon",
    position: { x: 1300, y: -400 },
    date: "Jan–May 2025",
    chronoOrder: 202501,
    skills: ["CATIA V6", "Fusion 360", "GD&T", "MS Project", "Cold Welding", "Systems Integration", "FEA", "Arduino", "Raspberry Pi Pico"],
    details:
      "Design and development of a transport system for vegetable collection for the Canadian Space Agency, built as part of the Lunar Exploration Accelerator Program (LEAP) at Polytechnique Montréal (Jan–May 2025). Served as Project Manager and Systems Integrator, directing end-to-end design and integration of a lunar produce-transport prototype compliant with CSA performance and safety standards. Coordinated cross-disciplinary work, milestones, and deliverables using Microsoft Project. Built detailed 3D assemblies and ran kinematic/structural analysis in CATIA and Fusion 360 to validate motion profiles and load-bearing capacity. Developed the rail-guided transport wagon's Arduino control logic for precise positioning along the telescopic support tube, and designed/programmed a Raspberry Pi Pico belt conveyor for vegetable transfer from lunar greenhouse to habitat module.",
    emoji: "🌕",
    color: "#b8860b",
    gravityMass: 850,
    fieldType: "typhoon",
    fieldRadius: 270,
    github: "https://github.com/Louiszhang2005-1",
    assemblyParts: [
      { id: "leap-tube", label: "Transport Tube (Ø540mm)", shape: "rect", width: 110, height: 28, mass: 14, color: "#8B8A9A", targetX: 0, targetY: 0 },
      { id: "leap-mli", label: "MLI Thermal Wrap", shape: "rect", width: 114, height: 10, mass: 3, color: "#d4a017", targetX: 0, targetY: -24 },
      { id: "leap-rail", label: "Carbon Rail", shape: "rect", width: 100, height: 8, mass: 5, color: "#222", targetX: 0, targetY: 12 },
      { id: "leap-wagon", label: "Arduino Wagon", shape: "rect", width: 32, height: 22, mass: 6, color: "#c62828", targetX: -35, targetY: 0 },
      { id: "leap-conveyor", label: "Pi Pico Conveyor", shape: "rect", width: 30, height: 14, mass: 4, color: "#1565c0", targetX: 35, targetY: 0 },
    ],
    image: "/media/csa/prototype-overview.jpg",
    images: [
      "/media/csa/prototype-overview.jpg",
      "/media/csa/tube-interior.jpg",
      "/media/csa/section-drawing.jpg",
      "/media/csa/isometric-drawing-bom.jpg",
      "/media/csa/isometric-view.webp",
      "/media/csa/section-view.webp",
      "/media/csa/section-view-copy.jpg",
    ],
    imageLabels: [
      "Prototype Overview",
      "Tube Interior",
      "Section Drawing",
      "BOM Drawing",
      "CAD Isometric",
      "CAD Section",
      "CAD Section Copy",
    ],
  },
  {
    id: "P-2",
    sector: "Aero Atoll",
    sectorColor: "#b8860b",
    title: "Axial Piston Pump",
    subtitle: "Hydraulic System Design · Nov–Dec 2024 · Polytechnique Montréal",
    status: "active",
    landmark: "A giant, translucent mechanical pump with moving pistons",
    position: { x: 400, y: -400 },
    date: "Nov–Dec 2024",
    chronoOrder: 202411,
    skills: ["3D CAD", "SolidWorks", "Mechanical Design", "GD&T", "Assembly Modeling"],
    details:
      "3D CAD modeling project at Polytechnique Montréal (Nov–Dec 2024). Fully modeled a high-performance axial piston hydraulic pump from the ground up. The assembly consists of a Cylinder Block (Bloc-cylindre) housing 9 individual Piston Assemblies — each comprising a Piston and a Slipper Pad (Patin) — retained by a Retaining Plate (Plaque de retenue) and centered via a Spherical Nut (Noix sphérique). Optimized component geometry and assembly parameters to enhance mechanical durability and functionality. Produced a full exploded-view drawing with bilingual French/English BOM following standard drafting conventions.",
    emoji: "⚙️",
    color: "#4a4a4a",
    gravityMass: 750,
    fieldType: "gravity",
    fieldRadius: 260,
    assemblyParts: [
      { id: "pump-cylinder", label: "Bloc-cylindre", shape: "circle", width: 60, height: 60, mass: 15, color: "#5c5c5c", targetX: 0, targetY: 10 },
      { id: "pump-retainer", label: "Plaque de retenue", shape: "circle", width: 52, height: 52, mass: 8, color: "#909090", targetX: 0, targetY: -28 },
      { id: "pump-nut", label: "Noix sphérique", shape: "circle", width: 20, height: 20, mass: 3, color: "#b0b0b0", targetX: 0, targetY: -48 },
      { id: "pump-piston", label: "Piston (×9)", shape: "rect", width: 10, height: 32, mass: 4, color: "#c0c0c0", targetX: -20, targetY: -5 },
      { id: "pump-slipper", label: "Patin (×9)", shape: "circle", width: 14, height: 14, mass: 2, color: "#d4a017", targetX: 20, targetY: -30 },
    ],
    image: "/media/axial-piston-pump/exploded-drawing.jpg",
    images: [
      "/media/axial-piston-pump/exploded-drawing.jpg",
    ],
    imageLabels: [
      "Exploded Drawing",
    ],
  },
  {
    id: "P-3",
    sector: "Aero Atoll",
    sectorColor: "#b8860b",
    title: "Autonomous Reforestation Robot",
    subtitle: "RoboHacks Feb 2025 · Unexpected Expedition Award · 5th Overall",
    status: "active",
    landmark: "A tiny forest with a robot planting low-poly trees",
    position: { x: 1300, y: -1200 },
    date: "Feb 2025",
    chronoOrder: 202502,
    skills: ["Arduino C++", "IR Sensors", "Color Sensor", "DC Motors", "Recycled Materials"],
    details:
      "🏆 Winner of the Unexpected Expedition Award and 5th place finisher overall at RoboHacks (Feb 2025). Developed an autonomous seed-planting robot using C++ and the Arduino framework. Integrated two infrared sensors and a color sensor for precise navigation along a designated black line. Engineered a custom motorized seed dispenser for accurate seed placement, then designed and assembled the complete system independently for presentation to industry judges.",
    emoji: "🌱",
    color: "#2e7d32",
    gravityMass: 650,
    fieldType: "typhoon",
    fieldRadius: 240,
    github: "https://github.com/Louiszhang2005-1/RoboHacks-2025",
    assemblyParts: [
      { id: "robo-chassis", label: "Cardboard Chassis", shape: "rect", width: 80, height: 40, mass: 10, color: "#2e7d32", targetX: 0, targetY: 0 },
      { id: "robo-motor", label: "DC Motor", shape: "circle", width: 22, height: 22, mass: 5, color: "#555", targetX: -30, targetY: 15 },
      { id: "robo-dispenser", label: "Paper Dispenser", shape: "rect", width: 14, height: 35, mass: 3, color: "#c8a84b", targetX: 35, targetY: -15 },
      { id: "robo-wheels", label: "Wheels", shape: "rect", width: 90, height: 10, mass: 7, color: "#333", targetX: 0, targetY: 28 },
      { id: "robo-ir", label: "IR Sensor", shape: "circle", width: 14, height: 14, mass: 1, color: "#ff5722", targetX: -15, targetY: -25 },
      { id: "robo-color", label: "Color Sensor", shape: "circle", width: 14, height: 14, mass: 1, color: "#00d4ff", targetX: 15, targetY: -25 },
    ],
    image: "/media/robohacks/robot-held.jpg",
    images: [
      "/media/robohacks/robot-held.jpg",
      "/media/robohacks/robot-top.jpg",
    ],
    imageLabels: [
      "Prototype In Hand",
      "Top View Wiring",
    ],
  },

  {
    id: "P-11",
    sector: "Aero Atoll",
    sectorColor: "#b8860b",
    title: "MechPrep",
    subtitle: "McHacks 13 · Jan 2026",
    status: "active",
    landmark: "A holographic workshop with rotating CAD models and quiz stations",
    position: { x: 400, y: -1200 },
    date: "Jan 2026",
    chronoOrder: 202601,
    skills: ["React", "SolidWorks", "Blender", "Python", "AI API", "CAD Integration"],
    details:
      "Built at McHacks 13 (Jan 2026). As mechanical engineering students who spent countless hours scrolling Glassdoor and LinkedIn for interview prep, we created MechPrep: a platform to help mechanical and aerospace students prepare for interviews. We built 3D models in SolidWorks and Blender, then used React and Python to integrate the CAD assets into an interactive experience. The hardest parts were integrating the AI API and bringing CAD into the app. Next steps include adding more questions from different companies and helping companies generate interview questions for applicants.",
    emoji: "🔧",
    color: "#5c6bc0",
    gravityMass: 650,
    fieldType: "gravity",
    fieldRadius: 240,
    demo: "https://devpost.com/software/mechie",
    image: "/media/generated/mechprep.png",
    assemblyParts: [
      { id: "mech-cad", label: "CAD Model", shape: "rect", width: 60, height: 40, mass: 8, color: "#8B8682", targetX: 0, targetY: 0 },
      { id: "mech-gear", label: "Gear Component", shape: "circle", width: 30, height: 30, mass: 5, color: "#5c6bc0", targetX: -30, targetY: 15 },
      { id: "mech-bracket", label: "Bracket", shape: "rect", width: 20, height: 50, mass: 4, color: "#b8860b", targetX: 30, targetY: -10 },
      { id: "mech-ui", label: "React Interface", shape: "rect", width: 80, height: 18, mass: 2, color: "#00d4ff", targetX: 0, targetY: -32 },
    ],
  },

  // ═══════════════════════════════════════════════════
  // 🏥 Robotics Bay (Southwest) — Health & Safety Tech
  // ═══════════════════════════════════════════════════
  {
    id: "P-4",
    sector: "Robotics & IoT",
    sectorColor: "#c62828",
    title: "ResQ - Link",
    subtitle: "UpStart 2026 · Digital System for Disaster Management",
    status: "active",
    landmark: "A medical station with a giant glowing NFC wristband",
    position: { x: -1300, y: 400 },
    date: "Feb 2026",
    chronoOrder: 202602,
    skills: ["SolidWorks", "React", "Passive NFC", "Offline-Mesh Sync", "Medical Device CAD"],
    details:
      "Built at UpStart 2026 (Feb 2026). ResQ-Link is a multidisciplinary disaster-response system inspired by the information blackout caused by analog paper triage tags during mass casualty events. As a team of Mechanical, Electrical, and Software engineers from Polytechnique Montréal, we designed a ready-to-build system around three pillars: a ruggedized IP68-rated medical silicone band to protect internal circuitry, a passive NFC induction architecture that requires zero batteries, and a Command Center dashboard using an Offline-Mesh Data Sync protocol so data can reach hospitals even when cellular networks fail.",
    emoji: "🏥",
    color: "#c62828",
    gravityMass: 600,
    fieldType: "gravity",
    fieldRadius: 230,
    github: "https://github.com/Louiszhang2005-1/Band",
    assemblyParts: [
      { id: "resq-band", label: "Silicone Band", shape: "rect", width: 100, height: 20, mass: 3, color: "#3a5080", targetX: 0, targetY: 0 },
      { id: "resq-coil", label: "Copper Coil (Zero-Power)", shape: "circle", width: 24, height: 24, mass: 2, color: "#b87333", targetX: 0, targetY: 0 },
      { id: "resq-nfc", label: "Passive NFC Chip", shape: "rect", width: 14, height: 14, mass: 1, color: "#00d4ff", targetX: 0, targetY: 0 },
      { id: "resq-seal", label: "IP68 Overmold Seal", shape: "rect", width: 36, height: 28, mass: 2, color: "rgba(180,220,255,0.6)", targetX: 0, targetY: 0 },
    ],
    image: "/media/generated/resq-link.png",
    resources: [
      { label: "Pitch Deck", href: "/media/resq-link/pitch-deck.pdf", icon: "slideshow" },
      { label: "Drawings/Dashboard", href: "/media/resq-link/drawings-dashboard.pdf", icon: "dashboard" },
      { label: "Business Model", href: "/media/resq-link/business-model-canvas.pdf", icon: "business_center" },
    ],
  },
  {
    id: "P-5",
    sector: "Robotics & IoT",
    sectorColor: "#c62828",
    title: "Nursie",
    subtitle: "Winner — ConUHacks X · Best Use of ElevenLabs",
    status: "active",
    landmark: "A futuristic care facility with a spinning radar dish and AI core",
    position: { x: -400, y: 400 },
    date: "Jan 2026",
    chronoOrder: 202601,
    skills: ["Python", "C++", "mmWave Radar", "ESP32 / FreeRTOS", "ROS 2", "MongoDB", "Gemini AI", "ElevenLabs", "OpenWRT"],
    details:
      "🏆 Best Use of ElevenLabs at ConUHacks X (Jan 2026). Nursie detects falls using mmWave radar and a floor vibration mat, tracks context with door-open and presence/occupancy sensing, monitors vital signs via a smartwatch, and sends immediate emergency alerts through phone calls and a dashboard. It builds a resident profile over time in MongoDB to flag unusual behavior such as leaving the apartment at night, and provides a voice interface for residents for questions, appointment reminders, and medication prompts. Design principles: fast reliable detection over fancy features, sensor redundancy to reduce false positives, and privacy by architecture with no always-streaming camera, no raw data leaving the network by default, and local processing wherever possible.",
    demo: "https://devpost.com/software/nursie",
    emoji: "🏆",
    color: "#1565c0",
    gravityMass: 700,
    fieldType: "typhoon",
    fieldRadius: 250,
    github: "https://github.com/Louiszhang2005-1",
    image: "/media/nursie/dashboard.png",
    images: [
      "/media/nursie/dashboard.png",
      "/media/nursie/door-sensor.jpg",
      "/media/nursie/door-sensor-part-2.jpg",
      "/media/nursie/fall-sensor.jpg",
      "/media/nursie/lidar-movement.jpg",
    ],
    imageLabels: [
      "Dashboard",
      "Door Sensor Node",
      "Door Sensor Mount",
      "Fall Sensor",
      "Movement Radar",
    ],
  },
  // ── Robotics & IoT: placeholder (locked) ─────────
  {
    id: "P-10",
    sector: "Robotics & IoT",
    sectorColor: "#c62828",
    title: "Milestone Node",
    subtitle: "Engineering Checkpoint",
    status: "locked",
    landmark: "A glowing milestone pillar with orbiting rings",
    position: { x: -1300, y: 1200 },
    date: null,
    chronoOrder: null,
    skills: [],
    details: "Reserved milestone checkpoint — briefing not yet available.",
    emoji: "🏆",
    color: "#c62828",
    gravityMass: 400,
    fieldType: "gravity",
    fieldRadius: 180,
  },

  // ═══════════════════════════════════════════════════
  // 💻 Code Cove (Southeast) — Software & AI Projects
  // ═══════════════════════════════════════════════════
  {
    id: "P-12",
    sector: "Code Cove",
    sectorColor: "#6a1b9a",
    title: "Lazycare",
    subtitle: "AI Health Assistant · UdemHacks · Mar 2025",
    status: "active",
    landmark: "A glowing AI clinic with floating chat bubbles and health charts",
    position: { x: 950, y: 1200 },
    date: "Mar 2025",
    chronoOrder: 202503,
    skills: ["Next.js", "Node.js", "Express", "Python", "FastAPI", "Fine-tuning", "TinyLlama", "AI"],
    details:
      "Built at UdemHacks (Mar 2025). LazyCare is an AI health assistant that provides personalized recommendations through text-based interactions. Built with Next.js, Node.js/Express, and Python/FastAPI, it features a personalized trained bot using fine-tuning to provide more accurate answers. It uses TinyLlama for health analysis and includes profile management, AI chat, and conversation history.",
    emoji: "💊",
    color: "#00897b",
    gravityMass: 550,
    fieldType: "gravity",
    fieldRadius: 220,
    github: "https://github.com/Karencheenn/LazyCare",
    image: "/media/generated/lazycare.png",
  },

  {
    id: "P-13",
    sector: "Code Cove",
    sectorColor: "#6a1b9a",
    title: "Virtual Interviewing Assistant",
    subtitle: "Brebeuf Hacks · Jan 2024 · Voice AI",
    status: "active",
    landmark: "A glowing interview booth with a floating AI avatar and speech waves",
    position: { x: 300, y: 400 },
    date: "Jan 2024",
    chronoOrder: 202401,
    skills: ["Python", "NLP", "Voice AI", "API Integration", "Natural Language Processing"],
    details:
      "Built at Brebeuf Hacks (Jan 2024) in a team of 3 to help computer science majors prepare for interviews. The project is a voice-based virtual assistant that gives interviewees potential interview questions and evaluates their answers. Developed with Python and API integration, it offers personalized interview guidance and a user-friendly interface powered by natural language processing algorithms.",
    emoji: "🎤",
    color: "#7b1fa2",
    gravityMass: 500,
    fieldType: "gravity",
    fieldRadius: 210,
    github: "https://github.com/Louiszhang2005-1/Virtual_interviewing_assistant",
    image: "/media/generated/interview-assistant.png",
  },

  {
    id: "P-9",
    sector: "Code Cove",
    sectorColor: "#6a1b9a",
    title: "Fully Integrated CRM Outreach Tool",
    subtitle: "AOTC 2026 · Accenture · Mar–Apr 2026",
    status: "active",
    landmark: "A data-funnel temple with AI circuits",
    position: { x: 1650, y: 1200 },
    date: "Mar–Apr 2026",
    chronoOrder: 202603,
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Gemini AI", "Resend", "Apollo.io", "Google Sheets API"],
    details:
      "Developed a complete CRM tool for a Montreal urban agriculture cooperative as part of AOTC 2026 with Accenture. The app automates outreach, manages client relationships, and tracks bookings end to end. It manages contact lists across 3 audience segments (corporate, schools, institutions & media), uses Google Gemini AI to generate personalized cold emails tailored to each contact's name, title, and organization, sends emails directly through the app, tracks every contact through the full sales pipeline, syncs all data to Google Sheets in real time, centralizes booking requests, calculates estimated revenue per visit automatically, and lets the team accept, refuse, or cancel reservations with instant professional client emails. Total cost to run: ~$0/month on free tiers.",
    emoji: "🤖",
    color: "#ad1457",
    gravityMass: 550,
    fieldType: "typhoon",
    fieldRadius: 230,
    github: "https://github.com/Louiszhang2005-1/Fully-Integrated-CRM-Tool",
    demo: "https://www.youtube.com/watch?v=TVuFauDyA00",
    image: "/media/generated/crm-outreach.png",
  },
];

/** Half-size of the playable world in world units — EXPANDED for more spacing */
export const WORLD_BOUNDS = 2000;

/** Spawn position (center of map) */
export const SPAWN_POSITION = { x: 0, y: 0 };

/** Collision radius for project zones (smaller) */
export const COLLISION_RADIUS = 110;

/** Sector info for the treasure map */
export const sectorInfo = [
  {
    name: "Internship Shores",
    emoji: "⚡",
    color: "#e65100",
    description: "Professional work experience",
    quadrant: "Northwest",
    ids: ["I-4", "I-2", "I-1", "I-3"],
  },
  {
    name: "Aero Atoll",
    emoji: "🚀",
    color: "#b8860b",
    description: "Aerospace & Mechanical projects",
    quadrant: "Northeast",
    ids: ["P-1", "P-2", "P-3", "P-11"],
  },
  {
    name: "Robotics & IoT",
    emoji: "🤖",
    color: "#c62828",
    description: "Robotics & IoT systems",
    quadrant: "Southwest",
    ids: ["P-4", "P-5", "P-10"],
  },
  {
    name: "Code Cove",
    emoji: "💻",
    color: "#6a1b9a",
    description: "Software & AI projects",
    quadrant: "Southeast",
    ids: ["P-9", "P-12", "P-13"],
  },
];

/** Get active missions only */
export function getActiveMissions(): Mission[] {
  return missions.filter((m) => m.status === "active");
}

/** Get a mission by ID */
export function getMissionById(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}

/** All unique sectors */
export const sectors = [...new Set(missions.map((m) => m.sector))];

/* ─── Collectibles (Perseverance Points) ─── */

export interface Collectible {
  id: string;
  type: "coin" | "chest";
  position: { x: number; y: number };
  points: number;
}

function makeRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function generateCollectibles(): Collectible[] {
  const rng = makeRng(314159);
  const items: Collectible[] = [];
  for (let i = 0; i < 40; i++) {
    items.push({ id: `coin-${i}`, type: "coin", position: { x: (rng() - 0.5) * 3600, y: (rng() - 0.5) * 3600 }, points: 10 });
  }
  for (let i = 0; i < 12; i++) {
    items.push({ id: `chest-${i}`, type: "chest", position: { x: (rng() - 0.5) * 3200, y: (rng() - 0.5) * 3200 }, points: 50 });
  }
  return items;
}

export const collectibles: Collectible[] = generateCollectibles();
export const MAX_COLLECTIBLE_SCORE = collectibles.reduce((s, c) => s + c.points, 0);

/* ─── Fog of War Zones ─── */

export interface FogZone {
  x: number;
  y: number;
  size: number;
}

export const FOG_REVEAL_RADIUS = 550;

function generateFogZones(): FogZone[] {
  const rng = makeRng(777);
  const zones: FogZone[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2 + rng() * 0.28;
    const radius = 1000 + rng() * 1000;
    zones.push({
      x: Math.cos(angle) * radius + (rng() - 0.5) * 250,
      y: Math.sin(angle) * radius + (rng() - 0.5) * 250,
      size: 380 + rng() * 300,
    });
  }
  return zones;
}

export const fogZones: FogZone[] = generateFogZones();

/* ─── Hazard Zones ─── */

export interface HazardZone {
  id: string;
  type: "thermal" | "pressure";
  position: { x: number; y: number };
  radius: number;
  intensity: number; // 0-1
}

export const hazardZones: HazardZone[] = [
  // Thermal vents — spaced between sectors
  { id: "thermal-1", type: "thermal", position: { x: -100, y: -700 }, radius: 140, intensity: 0.6 },
  { id: "thermal-2", type: "thermal", position: { x: 400, y: -400 }, radius: 120, intensity: 0.5 },
  { id: "thermal-3", type: "thermal", position: { x: -700, y: 200 }, radius: 130, intensity: 0.55 },
  { id: "thermal-4", type: "thermal", position: { x: 900, y: 300 }, radius: 110, intensity: 0.7 },
  // High-pressure zones
  { id: "pressure-1", type: "pressure", position: { x: 200, y: 200 }, radius: 100, intensity: 0.5 },
  { id: "pressure-2", type: "pressure", position: { x: -500, y: -300 }, radius: 110, intensity: 0.45 },
  { id: "pressure-3", type: "pressure", position: { x: 1000, y: -800 }, radius: 100, intensity: 0.6 },
  { id: "pressure-4", type: "pressure", position: { x: -300, y: 800 }, radius: 120, intensity: 0.5 },
];

/* ─── Explosive Barrels ─── */

export interface Barrel {
  id: string;
  position: { x: number; y: number };
}

function generateBarrels(): Barrel[] {
  const rng = makeRng(999);
  return Array.from({ length: 6 }, (_, i) => ({
    id: `barrel-${i}`,
    position: { x: (rng() - 0.5) * 3400, y: (rng() - 0.5) * 3400 },
  }));
}

export const barrels: Barrel[] = generateBarrels();
