export type PortfolioItem = {
  id: string;
  type: 'internship' | 'project';
  category: string;
  title: string;
  subtitle: string;
  status: string;
  order: number;
  skills: readonly string[];
  summary: string;
  links: { github: string | null; demo: string | null };
  media: { image: string | null; logo: string | null };
};

export const portfolioData = {
  "profile": {
    "name": "Louis Zhang",
    "role": "Mechanical Engineering Student",
    "focus": [
      "Mechanical design",
      "CAD and GD&T",
      "FEA and structural validation",
      "Manufacturing engineering",
      "Robotics and embedded systems",
      "Software and AI tools"
    ]
  },
  "sections": {
    "internships": {
      "label": "Internships",
      "items": [
        {
          "id": "I-4",
          "type": "internship",
          "category": "Internships",
          "title": "City of Montreal",
          "subtitle": "Scientific Intern Â· Water Department",
          "status": "active",
          "order": 1,
          "skills": [
            "Data Analysis",
            "Environmental Engineering",
            "Python",
            "GIS"
          ],
          "summary": "Scientific Intern at the City of Montreal's Water Department (Mayâ€“Aug 2025). Contributed to water quality monitoring initiatives and geospatial data pipelines for municipal infrastructure management.",
          "links": {
            "github": null,
            "demo": null
          },
          "media": {
            "image": "/logo/city-of-montreal.gif",
            "logo": "/logo/city-of-montreal.gif"
          }
        },
        {
          "id": "I-2",
          "type": "internship",
          "category": "Internships",
          "title": "Lockheed Martin",
          "subtitle": "Engineering Intern",
          "status": "active",
          "order": 2,
          "skills": [
            "3D CAD Modeling",
            "Structural Design",
            "CATIA",
            "GD&T",
            "FEA"
          ],
          "summary": "Engineering Intern at Lockheed Martin. Worked on 3D CAD modeling and structural design of airframe components. Performed FEA on composite panels for airframe programs. Delivered full CAD assemblies with tolerance stack-up analysis and GD&T documentation.",
          "links": {
            "github": null,
            "demo": null
          },
          "media": {
            "image": "/logo/Lockheed.webp",
            "logo": "/logo/Lockheed.webp"
          }
        },
        {
          "id": "I-1",
          "type": "internship",
          "category": "Internships",
          "title": "Tesla",
          "subtitle": "Manufacturing Engineering Intern Â· Cell Engineering",
          "status": "active",
          "order": 3,
          "skills": [
            "Manufacturing",
            "Automation",
            "Battery Cell Engineering",
            "Python",
            "Lean Six Sigma"
          ],
          "summary": "Incoming Manufacturing Engineering Intern at Tesla's Gigafactory, Cell Engineering department (Summer 2026). Focused on battery cell manufacturing processes, production line optimization, and automation systems for next-gen energy storage.",
          "links": {
            "github": null,
            "demo": null
          },
          "media": {
            "image": "/logo/tesla.jpg",
            "logo": "/logo/tesla.jpg"
          }
        }
      ]
    },
    "aerospace": {
      "label": "Aerospace & Mechanical",
      "items": [
        {
          "id": "P-1",
          "type": "project",
          "category": "Aerospace & Mechanical",
          "title": "CSA Lunar LEAP",
          "subtitle": "PM & Systems Integrator Â· CSA LEAP Â· Janâ€“May 2025 Â· Polytechnique MontrÃ©al",
          "status": "active",
          "order": 1,
          "skills": [
            "CATIA V6",
            "Fusion 360",
            "GD&T",
            "MS Project",
            "Cold Welding",
            "Systems Integration",
            "FEA",
            "Arduino",
            "Raspberry Pi Pico"
          ],
          "summary": "PM & Systems Integrator for the Canadian Space Agency Lunar Exploration Accelerator Program (LEAP) â€” OASIS Mission (Janâ€“May 2025, Polytechnique MontrÃ©al). Directed end-to-end design of a 3.1m telescopic lunar produce-transport tube (Ã˜540mm, 3080mm deployed length) fully compliant with CSA performance and safety standards. Managed 50+ part interfaces, achieved a 12% system mass reduction while sustaining a 2.5Ã— structural safety factor. Ran thermal FEA over the 14-day lunar night cycle and validated zero mechanical interference across the full telescopic deployment sweep. Developed the rail-guided transport wagon's control logic on an Arduino microcontroller â€” ensuring precision positioning along the telescopic support tube. Designed and programmed a Raspberry Pi Picoâ€“driven belt conveyor for seamless vegetable transfer from lunar greenhouse to habitat module. Led physical integration: AL-6061 machining, MLI fabrication, PCB prototyping, wiring harnesses, and cold-welding of tab-to-tube joints.",
          "links": {
            "github": "https://github.com/Louiszhang2005-1",
            "demo": null
          },
          "media": {
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfmEpezBSpneFvCrYKhOLUOseL8Ykp1jo-HSG-ffLWpXFUDPcJaLNQ_yYG5K3rrQojomG93egnxnwooCUeOcPCLWPOTN3DCgnuB1cKbCeyo00IDUBjs5tK3QD_526_Tv0wWlf_J9c26MbyCm2M9Bh0lHMTaYyyp_lR2bOctqYMSHKc0imzdeQ5FArd6MJgX1SS1NDA5WuXGr8-BMg81vmKL76Uzzftusbi3MNmNr5KKskCa3NgMBifjJq1unU1ixty6_658_OlN05p",
            "logo": null
          }
        },
        {
          "id": "P-2",
          "type": "project",
          "category": "Aerospace & Mechanical",
          "title": "Axial Piston Pump",
          "subtitle": "Hydraulic System Design Â· Novâ€“Dec 2024 Â· Polytechnique MontrÃ©al",
          "status": "active",
          "order": 2,
          "skills": [
            "3D CAD",
            "SolidWorks",
            "Mechanical Design",
            "GD&T",
            "Assembly Modeling"
          ],
          "summary": "3D CAD modeling project at Polytechnique MontrÃ©al (Novâ€“Dec 2024). Fully modeled a high-performance axial piston hydraulic pump from the ground up. The assembly consists of a Cylinder Block (Bloc-cylindre) housing 9 individual Piston Assemblies â€” each comprising a Piston and a Slipper Pad (Patin) â€” retained by a Retaining Plate (Plaque de retenue) and centered via a Spherical Nut (Noix sphÃ©rique). Optimized component geometry and assembly parameters to enhance mechanical durability and functionality. Produced a full exploded-view drawing with bilingual French/English BOM following standard drafting conventions.",
          "links": {
            "github": null,
            "demo": null
          },
          "media": {
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfmEpezBSpneFvCrYKhOLUOseL8Ykp1jo-HSG-ffLWpXFUDPcJaLNQ_yYG5K3rrQojomG93egnxnwooCUeOcPCLWPOTN3DCgnuB1cKbCeyo00IDUBjs5tK3QD_526_Tv0wWlf_J9c26MbyCm2M9Bh0lHMTaYyyp_lR2bOctqYMSHKc0imzdeQ5FArd6MJgX1SS1NDA5WuXGr8-BMg81vmKL76Uzzftusbi3MNmNr5KKskCa3NgMBifjJq1unU1ixty6_658_OlN05p",
            "logo": null
          }
        },
        {
          "id": "P-3",
          "type": "project",
          "category": "Aerospace & Mechanical",
          "title": "Reforestation Robot",
          "subtitle": "RoboHacks Feb 2025 Â· Unexpected Expedition Award Â· 5th Overall",
          "status": "active",
          "order": 3,
          "skills": [
            "Arduino C++",
            "IR Sensors",
            "Color Sensor",
            "DC Motors",
            "Recycled Materials"
          ],
          "summary": "ðŸ† Winner â€” Unexpected Expedition Award Â· 5th Place Overall at RoboHacks (Feb 2025). Built a fully autonomous seed-planting robot in 24 hours using recycled materials â€” cardboard chassis, plastic bottles, and a paper-engineered seed dispenser. Coded the full navigation and dispensing sequence in C++ on Arduino: two IR sensors fused with a color sensor for line-following, servo-actuated paper dispenser for timed seed placement. Wired all electronics on a breadboard from scratch under competition conditions.",
          "links": {
            "github": "https://github.com/Louiszhang2005-1/RoboHacks-2025",
            "demo": null
          },
          "media": {
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
            "logo": null
          }
        },
        {
          "id": "P-11",
          "type": "project",
          "category": "Aerospace & Mechanical",
          "title": "MechPrep",
          "subtitle": "McHacks 13 Â· Jan 2026",
          "status": "active",
          "order": 4,
          "skills": [
            "SolidWorks",
            "Blender",
            "React",
            "Python",
            "AI API",
            "3D Modeling",
            "CAD Integration"
          ],
          "summary": "Built at McHacks 13 (Jan 2026). As mechanical engineering students who have spent countless hours scrolling Glassdoor and LinkedIn preparing for technical interviews, we built MechPrep â€” an interactive interview prep platform tailored for mechanical and aerospace engineering students. Designed and modeled 3D components in SolidWorks and Blender, then integrated the CAD models into a React + Python web app to make them interactive and educational. Integrated an AI API to generate and evaluate interview questions. Key challenges: wiring the AI API into the project architecture and embedding interactive CAD models into the browser. Next steps: expand the question bank across more companies and offer a white-label tool to help companies generate their own technical interview questions.",
          "links": {
            "github": null,
            "demo": "https://devpost.com/software/mechie"
          },
          "media": {
            "image": null,
            "logo": null
          }
        }
      ]
    },
    "robotics": {
      "label": "Robotics & IoT",
      "items": [
        {
          "id": "P-4",
          "type": "project",
          "category": "Robotics & IoT",
          "title": "ResQ-Link",
          "subtitle": "UpStart 2026 Â· Digital System for Disaster Management",
          "status": "active",
          "order": 1,
          "skills": [
            "SolidWorks",
            "Passive NFC",
            "IP68 Design",
            "PCB Prototyping",
            "Next.js",
            "Medical Design",
            "Systems Architecture"
          ],
          "summary": "Built at UpStart 2026 (Feb 2026) as part of a multidisciplinary team from Polytechnique MontrÃ©al. In Montreal, analog paper triage tags contribute to a 30% triage error rate, $1.7B in annual malpractice losses, and 10.5-hour average ER wait times. ResQ-Link replaces paper tags with a zero-power passive NFC bracelet: inductive copper coil (no battery required), passive NFC chip, IP68 medical-grade silicone band with translucent overmolded seal. Bundled with the SmartTriage companion dashboard â€” a full Command Center featuring real-time bracelet location maps, tag management (Morgue/Immediate/Delayed/Minor), registered staff tracking, and an offline-mesh data sync protocol so data reaches the hospital even when cellular fails. Business model: hardware 'Blade' at $1.50/unit (80% gross margin at scale) + software 'Razor' SaaS at $10kâ€“$50k/facility/year. Targeting $750k seed round for MUHC 5,000-unit pilot, Health Canada Class I/II certification, and Quebec 'Buy Local' procurement priority.",
          "links": {
            "github": "https://github.com/Louiszhang2005-1/Band",
            "demo": null
          },
          "media": {
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
            "logo": null
          }
        },
        {
          "id": "P-5",
          "type": "project",
          "category": "Robotics & IoT",
          "title": "Nursie",
          "subtitle": "Winner â€” ConUHacks X Â· Best Use of ElevenLabs",
          "status": "active",
          "order": 2,
          "skills": [
            "Python",
            "C++",
            "mmWave Radar",
            "ESP32 / FreeRTOS",
            "ROS 2",
            "MongoDB",
            "Gemini AI",
            "ElevenLabs",
            "OpenWRT"
          ],
          "summary": "ðŸ† Winner at ConUHacks X â€” Best Use of ElevenLabs (Jan 2026). Co-founded an on-premises AI nurse assistant for Quebec long-term care facilities (CHSLDs). Falls among seniors (65+) have risen 47% between 2008â€“2019 â€” Nursie closes the gap between unwitnessed falls and delayed staff response. What it does: (1) detects falls using mmWave radar (IWR6843) fused with a floor vibration mat; (2) tracks room context via magnetic door sensor + PIR presence/occupancy node on ESP32/FreeRTOS; (3) monitors vital signs via smartwatch integration; (4) sends immediate alerts â€” phone call + dashboard push â€” to staff on detection; (5) builds a resident profile in MongoDB over time to flag unusual behavior (e.g. leaving the apartment at night); (6) provides a voice interface for residents via ElevenLabs for questions, appointment reminders, and medication prompts. Design principles: fast reliable detection over fancy features; 3Ã— sensor redundancy to reduce false positives (radar + vibration mat + wearable fused for confidence scoring); privacy by architecture â€” all data stays on the facility's local OpenWRT LAN, no cameras, no cloud.",
          "links": {
            "github": "https://github.com/Louiszhang2005-1",
            "demo": "https://devpost.com/software/nursie"
          },
          "media": {
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
            "logo": null
          }
        }
      ]
    },
    "software": {
      "label": "Software & AI",
      "items": [
        {
          "id": "P-9",
          "type": "project",
          "category": "Software & AI",
          "title": "CRM Outreach Tool",
          "subtitle": "Accenture Â· AOTC 2026 Â· Marâ€“Apr 2026",
          "status": "active",
          "order": 1,
          "skills": [
            "Next.js",
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Gemini AI",
            "Resend",
            "Apollo.io",
            "Google Sheets API"
          ],
          "summary": "Fully integrated CRM outreach tool built for a Montreal urban agriculture cooperative (La Centrale Agricole), developed as part of Accenture's AOTC 2026 program. Manages contact lists across 3 audience segments (corporate, schools, institutions & media). Uses Google Gemini AI to generate personalized cold emails tailored to each contact's name, title, and organization â€” then sends them directly through the app. Tracks every contact through the full sales pipeline, syncs all data to Google Sheets in real time, and centralizes booking requests with auto-calculated revenue estimates. Team can accept, refuse, or cancel reservations â€” triggering a professional email to the client instantly. Total running cost: ~$0/month on free tiers.",
          "links": {
            "github": "https://github.com/Louiszhang2005-1/Fully-Integrated-CRM-Tool",
            "demo": "https://www.youtube.com/watch?v=TVuFauDyA00"
          },
          "media": {
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAq3y0pe5-zj445NQYKmzbJNwSt6pwKm-RRaSroWdOsq0I9WvDU4tlIf_le6clLEAU1EU_s99pamo_RefOqMxhNv1gYMTs8tPSds7Jkb4ZRhxpEU9UQElEzVJSAoqViv4qiKxxL8YG9QR_aSkWObExq5swckGUTYd52SXI-msGM0W3mwkQaAm_mq0ahm8uaF08K-nIl5jUrIwBV32yVovAyJQHnlDfbkAO7aB-NtTFoGg_DNNFBe_PUARobX_wFyaL9hpiLkuNQrBNF",
            "logo": null
          }
        },
        {
          "id": "P-12",
          "type": "project",
          "category": "Software & AI",
          "title": "LazyCare",
          "subtitle": "UdemHacks Â· Mar 2025 Â· AI Health Assistant",
          "status": "active",
          "order": 2,
          "skills": [
            "Next.js",
            "Node.js",
            "Express",
            "Python",
            "FastAPI",
            "Fine-tuning",
            "TinyLlama",
            "AI"
          ],
          "summary": "Built at UdemHacks (Mar 2025). LazyCare is an AI health assistant that provides personalized health recommendations via text-based interactions. Backend stack: Next.js frontend, Node.js/Express middleware, and a Python FastAPI service running a fine-tuned TinyLlama model for domain-specific health analysis. Fine-tuning allows the model to give more accurate, context-aware answers than a vanilla LLM. Features: personalized profile management, AI chat interface, and full conversation history so the assistant learns your context over time.",
          "links": {
            "github": "https://github.com/Karencheenn/LazyCare",
            "demo": null
          },
          "media": {
            "image": null,
            "logo": null
          }
        },
        {
          "id": "P-13",
          "type": "project",
          "category": "Software & AI",
          "title": "Interview Assistant",
          "subtitle": "Brebeuf Hacks Â· Jan 2024 Â· Voice AI",
          "status": "active",
          "order": 3,
          "skills": [
            "Python",
            "NLP",
            "Voice AI",
            "API Integration",
            "Natural Language Processing"
          ],
          "summary": "Built at Brebeuf Hacks (Jan 2024) in a team of 3. A voice-based virtual interviewing assistant designed to help computer science students prepare for technical interviews. The assistant presents personalized interview questions verbally, listens to the interviewee's response, and evaluates the answer using natural language processing algorithms. Developed with Python and integrated an AI/NLP API to power the intelligent question-and-answer pipeline. Features a user-friendly voice interface so students can practice in a realistic spoken-word format rather than typing.",
          "links": {
            "github": "https://github.com/Louiszhang2005-1/Virtual_interviewing_assistant",
            "demo": null
          },
          "media": {
            "image": null,
            "logo": null
          }
        }
      ]
    }
  },
  "internships": [
    {
      "id": "I-4",
      "type": "internship",
      "category": "Internships",
      "title": "City of Montreal",
      "subtitle": "Scientific Intern Â· Water Department",
      "status": "active",
      "order": 1,
      "skills": [
        "Data Analysis",
        "Environmental Engineering",
        "Python",
        "GIS"
      ],
      "summary": "Scientific Intern at the City of Montreal's Water Department (Mayâ€“Aug 2025). Contributed to water quality monitoring initiatives and geospatial data pipelines for municipal infrastructure management.",
      "links": {
        "github": null,
        "demo": null
      },
      "media": {
        "image": "/logo/city-of-montreal.gif",
        "logo": "/logo/city-of-montreal.gif"
      }
    },
    {
      "id": "I-2",
      "type": "internship",
      "category": "Internships",
      "title": "Lockheed Martin",
      "subtitle": "Engineering Intern",
      "status": "active",
      "order": 2,
      "skills": [
        "3D CAD Modeling",
        "Structural Design",
        "CATIA",
        "GD&T",
        "FEA"
      ],
      "summary": "Engineering Intern at Lockheed Martin. Worked on 3D CAD modeling and structural design of airframe components. Performed FEA on composite panels for airframe programs. Delivered full CAD assemblies with tolerance stack-up analysis and GD&T documentation.",
      "links": {
        "github": null,
        "demo": null
      },
      "media": {
        "image": "/logo/Lockheed.webp",
        "logo": "/logo/Lockheed.webp"
      }
    },
    {
      "id": "I-1",
      "type": "internship",
      "category": "Internships",
      "title": "Tesla",
      "subtitle": "Manufacturing Engineering Intern Â· Cell Engineering",
      "status": "active",
      "order": 3,
      "skills": [
        "Manufacturing",
        "Automation",
        "Battery Cell Engineering",
        "Python",
        "Lean Six Sigma"
      ],
      "summary": "Incoming Manufacturing Engineering Intern at Tesla's Gigafactory, Cell Engineering department (Summer 2026). Focused on battery cell manufacturing processes, production line optimization, and automation systems for next-gen energy storage.",
      "links": {
        "github": null,
        "demo": null
      },
      "media": {
        "image": "/logo/tesla.jpg",
        "logo": "/logo/tesla.jpg"
      }
    }
  ],
  "projects": [
    {
      "id": "P-1",
      "type": "project",
      "category": "Aerospace & Mechanical",
      "title": "CSA Lunar LEAP",
      "subtitle": "PM & Systems Integrator Â· CSA LEAP Â· Janâ€“May 2025 Â· Polytechnique MontrÃ©al",
      "status": "active",
      "order": 1,
      "skills": [
        "CATIA V6",
        "Fusion 360",
        "GD&T",
        "MS Project",
        "Cold Welding",
        "Systems Integration",
        "FEA",
        "Arduino",
        "Raspberry Pi Pico"
      ],
      "summary": "PM & Systems Integrator for the Canadian Space Agency Lunar Exploration Accelerator Program (LEAP) â€” OASIS Mission (Janâ€“May 2025, Polytechnique MontrÃ©al). Directed end-to-end design of a 3.1m telescopic lunar produce-transport tube (Ã˜540mm, 3080mm deployed length) fully compliant with CSA performance and safety standards. Managed 50+ part interfaces, achieved a 12% system mass reduction while sustaining a 2.5Ã— structural safety factor. Ran thermal FEA over the 14-day lunar night cycle and validated zero mechanical interference across the full telescopic deployment sweep. Developed the rail-guided transport wagon's control logic on an Arduino microcontroller â€” ensuring precision positioning along the telescopic support tube. Designed and programmed a Raspberry Pi Picoâ€“driven belt conveyor for seamless vegetable transfer from lunar greenhouse to habitat module. Led physical integration: AL-6061 machining, MLI fabrication, PCB prototyping, wiring harnesses, and cold-welding of tab-to-tube joints.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1",
        "demo": null
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfmEpezBSpneFvCrYKhOLUOseL8Ykp1jo-HSG-ffLWpXFUDPcJaLNQ_yYG5K3rrQojomG93egnxnwooCUeOcPCLWPOTN3DCgnuB1cKbCeyo00IDUBjs5tK3QD_526_Tv0wWlf_J9c26MbyCm2M9Bh0lHMTaYyyp_lR2bOctqYMSHKc0imzdeQ5FArd6MJgX1SS1NDA5WuXGr8-BMg81vmKL76Uzzftusbi3MNmNr5KKskCa3NgMBifjJq1unU1ixty6_658_OlN05p",
        "logo": null
      }
    },
    {
      "id": "P-2",
      "type": "project",
      "category": "Aerospace & Mechanical",
      "title": "Axial Piston Pump",
      "subtitle": "Hydraulic System Design Â· Novâ€“Dec 2024 Â· Polytechnique MontrÃ©al",
      "status": "active",
      "order": 2,
      "skills": [
        "3D CAD",
        "SolidWorks",
        "Mechanical Design",
        "GD&T",
        "Assembly Modeling"
      ],
      "summary": "3D CAD modeling project at Polytechnique MontrÃ©al (Novâ€“Dec 2024). Fully modeled a high-performance axial piston hydraulic pump from the ground up. The assembly consists of a Cylinder Block (Bloc-cylindre) housing 9 individual Piston Assemblies â€” each comprising a Piston and a Slipper Pad (Patin) â€” retained by a Retaining Plate (Plaque de retenue) and centered via a Spherical Nut (Noix sphÃ©rique). Optimized component geometry and assembly parameters to enhance mechanical durability and functionality. Produced a full exploded-view drawing with bilingual French/English BOM following standard drafting conventions.",
      "links": {
        "github": null,
        "demo": null
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfmEpezBSpneFvCrYKhOLUOseL8Ykp1jo-HSG-ffLWpXFUDPcJaLNQ_yYG5K3rrQojomG93egnxnwooCUeOcPCLWPOTN3DCgnuB1cKbCeyo00IDUBjs5tK3QD_526_Tv0wWlf_J9c26MbyCm2M9Bh0lHMTaYyyp_lR2bOctqYMSHKc0imzdeQ5FArd6MJgX1SS1NDA5WuXGr8-BMg81vmKL76Uzzftusbi3MNmNr5KKskCa3NgMBifjJq1unU1ixty6_658_OlN05p",
        "logo": null
      }
    },
    {
      "id": "P-3",
      "type": "project",
      "category": "Aerospace & Mechanical",
      "title": "Reforestation Robot",
      "subtitle": "RoboHacks Feb 2025 Â· Unexpected Expedition Award Â· 5th Overall",
      "status": "active",
      "order": 3,
      "skills": [
        "Arduino C++",
        "IR Sensors",
        "Color Sensor",
        "DC Motors",
        "Recycled Materials"
      ],
      "summary": "ðŸ† Winner â€” Unexpected Expedition Award Â· 5th Place Overall at RoboHacks (Feb 2025). Built a fully autonomous seed-planting robot in 24 hours using recycled materials â€” cardboard chassis, plastic bottles, and a paper-engineered seed dispenser. Coded the full navigation and dispensing sequence in C++ on Arduino: two IR sensors fused with a color sensor for line-following, servo-actuated paper dispenser for timed seed placement. Wired all electronics on a breadboard from scratch under competition conditions.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1/RoboHacks-2025",
        "demo": null
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
        "logo": null
      }
    },
    {
      "id": "P-11",
      "type": "project",
      "category": "Aerospace & Mechanical",
      "title": "MechPrep",
      "subtitle": "McHacks 13 Â· Jan 2026",
      "status": "active",
      "order": 4,
      "skills": [
        "SolidWorks",
        "Blender",
        "React",
        "Python",
        "AI API",
        "3D Modeling",
        "CAD Integration"
      ],
      "summary": "Built at McHacks 13 (Jan 2026). As mechanical engineering students who have spent countless hours scrolling Glassdoor and LinkedIn preparing for technical interviews, we built MechPrep â€” an interactive interview prep platform tailored for mechanical and aerospace engineering students. Designed and modeled 3D components in SolidWorks and Blender, then integrated the CAD models into a React + Python web app to make them interactive and educational. Integrated an AI API to generate and evaluate interview questions. Key challenges: wiring the AI API into the project architecture and embedding interactive CAD models into the browser. Next steps: expand the question bank across more companies and offer a white-label tool to help companies generate their own technical interview questions.",
      "links": {
        "github": null,
        "demo": "https://devpost.com/software/mechie"
      },
      "media": {
        "image": null,
        "logo": null
      }
    },
    {
      "id": "P-4",
      "type": "project",
      "category": "Robotics & IoT",
      "title": "ResQ-Link",
      "subtitle": "UpStart 2026 Â· Digital System for Disaster Management",
      "status": "active",
      "order": 1,
      "skills": [
        "SolidWorks",
        "Passive NFC",
        "IP68 Design",
        "PCB Prototyping",
        "Next.js",
        "Medical Design",
        "Systems Architecture"
      ],
      "summary": "Built at UpStart 2026 (Feb 2026) as part of a multidisciplinary team from Polytechnique MontrÃ©al. In Montreal, analog paper triage tags contribute to a 30% triage error rate, $1.7B in annual malpractice losses, and 10.5-hour average ER wait times. ResQ-Link replaces paper tags with a zero-power passive NFC bracelet: inductive copper coil (no battery required), passive NFC chip, IP68 medical-grade silicone band with translucent overmolded seal. Bundled with the SmartTriage companion dashboard â€” a full Command Center featuring real-time bracelet location maps, tag management (Morgue/Immediate/Delayed/Minor), registered staff tracking, and an offline-mesh data sync protocol so data reaches the hospital even when cellular fails. Business model: hardware 'Blade' at $1.50/unit (80% gross margin at scale) + software 'Razor' SaaS at $10kâ€“$50k/facility/year. Targeting $750k seed round for MUHC 5,000-unit pilot, Health Canada Class I/II certification, and Quebec 'Buy Local' procurement priority.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1/Band",
        "demo": null
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
        "logo": null
      }
    },
    {
      "id": "P-5",
      "type": "project",
      "category": "Robotics & IoT",
      "title": "Nursie",
      "subtitle": "Winner â€” ConUHacks X Â· Best Use of ElevenLabs",
      "status": "active",
      "order": 2,
      "skills": [
        "Python",
        "C++",
        "mmWave Radar",
        "ESP32 / FreeRTOS",
        "ROS 2",
        "MongoDB",
        "Gemini AI",
        "ElevenLabs",
        "OpenWRT"
      ],
      "summary": "ðŸ† Winner at ConUHacks X â€” Best Use of ElevenLabs (Jan 2026). Co-founded an on-premises AI nurse assistant for Quebec long-term care facilities (CHSLDs). Falls among seniors (65+) have risen 47% between 2008â€“2019 â€” Nursie closes the gap between unwitnessed falls and delayed staff response. What it does: (1) detects falls using mmWave radar (IWR6843) fused with a floor vibration mat; (2) tracks room context via magnetic door sensor + PIR presence/occupancy node on ESP32/FreeRTOS; (3) monitors vital signs via smartwatch integration; (4) sends immediate alerts â€” phone call + dashboard push â€” to staff on detection; (5) builds a resident profile in MongoDB over time to flag unusual behavior (e.g. leaving the apartment at night); (6) provides a voice interface for residents via ElevenLabs for questions, appointment reminders, and medication prompts. Design principles: fast reliable detection over fancy features; 3Ã— sensor redundancy to reduce false positives (radar + vibration mat + wearable fused for confidence scoring); privacy by architecture â€” all data stays on the facility's local OpenWRT LAN, no cameras, no cloud.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1",
        "demo": "https://devpost.com/software/nursie"
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
        "logo": null
      }
    },
    {
      "id": "P-9",
      "type": "project",
      "category": "Software & AI",
      "title": "CRM Outreach Tool",
      "subtitle": "Accenture Â· AOTC 2026 Â· Marâ€“Apr 2026",
      "status": "active",
      "order": 1,
      "skills": [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Gemini AI",
        "Resend",
        "Apollo.io",
        "Google Sheets API"
      ],
      "summary": "Fully integrated CRM outreach tool built for a Montreal urban agriculture cooperative (La Centrale Agricole), developed as part of Accenture's AOTC 2026 program. Manages contact lists across 3 audience segments (corporate, schools, institutions & media). Uses Google Gemini AI to generate personalized cold emails tailored to each contact's name, title, and organization â€” then sends them directly through the app. Tracks every contact through the full sales pipeline, syncs all data to Google Sheets in real time, and centralizes booking requests with auto-calculated revenue estimates. Team can accept, refuse, or cancel reservations â€” triggering a professional email to the client instantly. Total running cost: ~$0/month on free tiers.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1/Fully-Integrated-CRM-Tool",
        "demo": "https://www.youtube.com/watch?v=TVuFauDyA00"
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAq3y0pe5-zj445NQYKmzbJNwSt6pwKm-RRaSroWdOsq0I9WvDU4tlIf_le6clLEAU1EU_s99pamo_RefOqMxhNv1gYMTs8tPSds7Jkb4ZRhxpEU9UQElEzVJSAoqViv4qiKxxL8YG9QR_aSkWObExq5swckGUTYd52SXI-msGM0W3mwkQaAm_mq0ahm8uaF08K-nIl5jUrIwBV32yVovAyJQHnlDfbkAO7aB-NtTFoGg_DNNFBe_PUARobX_wFyaL9hpiLkuNQrBNF",
        "logo": null
      }
    },
    {
      "id": "P-12",
      "type": "project",
      "category": "Software & AI",
      "title": "LazyCare",
      "subtitle": "UdemHacks Â· Mar 2025 Â· AI Health Assistant",
      "status": "active",
      "order": 2,
      "skills": [
        "Next.js",
        "Node.js",
        "Express",
        "Python",
        "FastAPI",
        "Fine-tuning",
        "TinyLlama",
        "AI"
      ],
      "summary": "Built at UdemHacks (Mar 2025). LazyCare is an AI health assistant that provides personalized health recommendations via text-based interactions. Backend stack: Next.js frontend, Node.js/Express middleware, and a Python FastAPI service running a fine-tuned TinyLlama model for domain-specific health analysis. Fine-tuning allows the model to give more accurate, context-aware answers than a vanilla LLM. Features: personalized profile management, AI chat interface, and full conversation history so the assistant learns your context over time.",
      "links": {
        "github": "https://github.com/Karencheenn/LazyCare",
        "demo": null
      },
      "media": {
        "image": null,
        "logo": null
      }
    },
    {
      "id": "P-13",
      "type": "project",
      "category": "Software & AI",
      "title": "Interview Assistant",
      "subtitle": "Brebeuf Hacks Â· Jan 2024 Â· Voice AI",
      "status": "active",
      "order": 3,
      "skills": [
        "Python",
        "NLP",
        "Voice AI",
        "API Integration",
        "Natural Language Processing"
      ],
      "summary": "Built at Brebeuf Hacks (Jan 2024) in a team of 3. A voice-based virtual interviewing assistant designed to help computer science students prepare for technical interviews. The assistant presents personalized interview questions verbally, listens to the interviewee's response, and evaluates the answer using natural language processing algorithms. Developed with Python and integrated an AI/NLP API to power the intelligent question-and-answer pipeline. Features a user-friendly voice interface so students can practice in a realistic spoken-word format rather than typing.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1/Virtual_interviewing_assistant",
        "demo": null
      },
      "media": {
        "image": null,
        "logo": null
      }
    }
  ],
  "allItems": [
    {
      "id": "I-4",
      "type": "internship",
      "category": "Internships",
      "title": "City of Montreal",
      "subtitle": "Scientific Intern Â· Water Department",
      "status": "active",
      "order": 1,
      "skills": [
        "Data Analysis",
        "Environmental Engineering",
        "Python",
        "GIS"
      ],
      "summary": "Scientific Intern at the City of Montreal's Water Department (Mayâ€“Aug 2025). Contributed to water quality monitoring initiatives and geospatial data pipelines for municipal infrastructure management.",
      "links": {
        "github": null,
        "demo": null
      },
      "media": {
        "image": "/logo/city-of-montreal.gif",
        "logo": "/logo/city-of-montreal.gif"
      }
    },
    {
      "id": "I-2",
      "type": "internship",
      "category": "Internships",
      "title": "Lockheed Martin",
      "subtitle": "Engineering Intern",
      "status": "active",
      "order": 2,
      "skills": [
        "3D CAD Modeling",
        "Structural Design",
        "CATIA",
        "GD&T",
        "FEA"
      ],
      "summary": "Engineering Intern at Lockheed Martin. Worked on 3D CAD modeling and structural design of airframe components. Performed FEA on composite panels for airframe programs. Delivered full CAD assemblies with tolerance stack-up analysis and GD&T documentation.",
      "links": {
        "github": null,
        "demo": null
      },
      "media": {
        "image": "/logo/Lockheed.webp",
        "logo": "/logo/Lockheed.webp"
      }
    },
    {
      "id": "I-1",
      "type": "internship",
      "category": "Internships",
      "title": "Tesla",
      "subtitle": "Manufacturing Engineering Intern Â· Cell Engineering",
      "status": "active",
      "order": 3,
      "skills": [
        "Manufacturing",
        "Automation",
        "Battery Cell Engineering",
        "Python",
        "Lean Six Sigma"
      ],
      "summary": "Incoming Manufacturing Engineering Intern at Tesla's Gigafactory, Cell Engineering department (Summer 2026). Focused on battery cell manufacturing processes, production line optimization, and automation systems for next-gen energy storage.",
      "links": {
        "github": null,
        "demo": null
      },
      "media": {
        "image": "/logo/tesla.jpg",
        "logo": "/logo/tesla.jpg"
      }
    },
    {
      "id": "P-1",
      "type": "project",
      "category": "Aerospace & Mechanical",
      "title": "CSA Lunar LEAP",
      "subtitle": "PM & Systems Integrator Â· CSA LEAP Â· Janâ€“May 2025 Â· Polytechnique MontrÃ©al",
      "status": "active",
      "order": 1,
      "skills": [
        "CATIA V6",
        "Fusion 360",
        "GD&T",
        "MS Project",
        "Cold Welding",
        "Systems Integration",
        "FEA",
        "Arduino",
        "Raspberry Pi Pico"
      ],
      "summary": "PM & Systems Integrator for the Canadian Space Agency Lunar Exploration Accelerator Program (LEAP) â€” OASIS Mission (Janâ€“May 2025, Polytechnique MontrÃ©al). Directed end-to-end design of a 3.1m telescopic lunar produce-transport tube (Ã˜540mm, 3080mm deployed length) fully compliant with CSA performance and safety standards. Managed 50+ part interfaces, achieved a 12% system mass reduction while sustaining a 2.5Ã— structural safety factor. Ran thermal FEA over the 14-day lunar night cycle and validated zero mechanical interference across the full telescopic deployment sweep. Developed the rail-guided transport wagon's control logic on an Arduino microcontroller â€” ensuring precision positioning along the telescopic support tube. Designed and programmed a Raspberry Pi Picoâ€“driven belt conveyor for seamless vegetable transfer from lunar greenhouse to habitat module. Led physical integration: AL-6061 machining, MLI fabrication, PCB prototyping, wiring harnesses, and cold-welding of tab-to-tube joints.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1",
        "demo": null
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfmEpezBSpneFvCrYKhOLUOseL8Ykp1jo-HSG-ffLWpXFUDPcJaLNQ_yYG5K3rrQojomG93egnxnwooCUeOcPCLWPOTN3DCgnuB1cKbCeyo00IDUBjs5tK3QD_526_Tv0wWlf_J9c26MbyCm2M9Bh0lHMTaYyyp_lR2bOctqYMSHKc0imzdeQ5FArd6MJgX1SS1NDA5WuXGr8-BMg81vmKL76Uzzftusbi3MNmNr5KKskCa3NgMBifjJq1unU1ixty6_658_OlN05p",
        "logo": null
      }
    },
    {
      "id": "P-2",
      "type": "project",
      "category": "Aerospace & Mechanical",
      "title": "Axial Piston Pump",
      "subtitle": "Hydraulic System Design Â· Novâ€“Dec 2024 Â· Polytechnique MontrÃ©al",
      "status": "active",
      "order": 2,
      "skills": [
        "3D CAD",
        "SolidWorks",
        "Mechanical Design",
        "GD&T",
        "Assembly Modeling"
      ],
      "summary": "3D CAD modeling project at Polytechnique MontrÃ©al (Novâ€“Dec 2024). Fully modeled a high-performance axial piston hydraulic pump from the ground up. The assembly consists of a Cylinder Block (Bloc-cylindre) housing 9 individual Piston Assemblies â€” each comprising a Piston and a Slipper Pad (Patin) â€” retained by a Retaining Plate (Plaque de retenue) and centered via a Spherical Nut (Noix sphÃ©rique). Optimized component geometry and assembly parameters to enhance mechanical durability and functionality. Produced a full exploded-view drawing with bilingual French/English BOM following standard drafting conventions.",
      "links": {
        "github": null,
        "demo": null
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfmEpezBSpneFvCrYKhOLUOseL8Ykp1jo-HSG-ffLWpXFUDPcJaLNQ_yYG5K3rrQojomG93egnxnwooCUeOcPCLWPOTN3DCgnuB1cKbCeyo00IDUBjs5tK3QD_526_Tv0wWlf_J9c26MbyCm2M9Bh0lHMTaYyyp_lR2bOctqYMSHKc0imzdeQ5FArd6MJgX1SS1NDA5WuXGr8-BMg81vmKL76Uzzftusbi3MNmNr5KKskCa3NgMBifjJq1unU1ixty6_658_OlN05p",
        "logo": null
      }
    },
    {
      "id": "P-3",
      "type": "project",
      "category": "Aerospace & Mechanical",
      "title": "Reforestation Robot",
      "subtitle": "RoboHacks Feb 2025 Â· Unexpected Expedition Award Â· 5th Overall",
      "status": "active",
      "order": 3,
      "skills": [
        "Arduino C++",
        "IR Sensors",
        "Color Sensor",
        "DC Motors",
        "Recycled Materials"
      ],
      "summary": "ðŸ† Winner â€” Unexpected Expedition Award Â· 5th Place Overall at RoboHacks (Feb 2025). Built a fully autonomous seed-planting robot in 24 hours using recycled materials â€” cardboard chassis, plastic bottles, and a paper-engineered seed dispenser. Coded the full navigation and dispensing sequence in C++ on Arduino: two IR sensors fused with a color sensor for line-following, servo-actuated paper dispenser for timed seed placement. Wired all electronics on a breadboard from scratch under competition conditions.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1/RoboHacks-2025",
        "demo": null
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
        "logo": null
      }
    },
    {
      "id": "P-11",
      "type": "project",
      "category": "Aerospace & Mechanical",
      "title": "MechPrep",
      "subtitle": "McHacks 13 Â· Jan 2026",
      "status": "active",
      "order": 4,
      "skills": [
        "SolidWorks",
        "Blender",
        "React",
        "Python",
        "AI API",
        "3D Modeling",
        "CAD Integration"
      ],
      "summary": "Built at McHacks 13 (Jan 2026). As mechanical engineering students who have spent countless hours scrolling Glassdoor and LinkedIn preparing for technical interviews, we built MechPrep â€” an interactive interview prep platform tailored for mechanical and aerospace engineering students. Designed and modeled 3D components in SolidWorks and Blender, then integrated the CAD models into a React + Python web app to make them interactive and educational. Integrated an AI API to generate and evaluate interview questions. Key challenges: wiring the AI API into the project architecture and embedding interactive CAD models into the browser. Next steps: expand the question bank across more companies and offer a white-label tool to help companies generate their own technical interview questions.",
      "links": {
        "github": null,
        "demo": "https://devpost.com/software/mechie"
      },
      "media": {
        "image": null,
        "logo": null
      }
    },
    {
      "id": "P-4",
      "type": "project",
      "category": "Robotics & IoT",
      "title": "ResQ-Link",
      "subtitle": "UpStart 2026 Â· Digital System for Disaster Management",
      "status": "active",
      "order": 1,
      "skills": [
        "SolidWorks",
        "Passive NFC",
        "IP68 Design",
        "PCB Prototyping",
        "Next.js",
        "Medical Design",
        "Systems Architecture"
      ],
      "summary": "Built at UpStart 2026 (Feb 2026) as part of a multidisciplinary team from Polytechnique MontrÃ©al. In Montreal, analog paper triage tags contribute to a 30% triage error rate, $1.7B in annual malpractice losses, and 10.5-hour average ER wait times. ResQ-Link replaces paper tags with a zero-power passive NFC bracelet: inductive copper coil (no battery required), passive NFC chip, IP68 medical-grade silicone band with translucent overmolded seal. Bundled with the SmartTriage companion dashboard â€” a full Command Center featuring real-time bracelet location maps, tag management (Morgue/Immediate/Delayed/Minor), registered staff tracking, and an offline-mesh data sync protocol so data reaches the hospital even when cellular fails. Business model: hardware 'Blade' at $1.50/unit (80% gross margin at scale) + software 'Razor' SaaS at $10kâ€“$50k/facility/year. Targeting $750k seed round for MUHC 5,000-unit pilot, Health Canada Class I/II certification, and Quebec 'Buy Local' procurement priority.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1/Band",
        "demo": null
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
        "logo": null
      }
    },
    {
      "id": "P-5",
      "type": "project",
      "category": "Robotics & IoT",
      "title": "Nursie",
      "subtitle": "Winner â€” ConUHacks X Â· Best Use of ElevenLabs",
      "status": "active",
      "order": 2,
      "skills": [
        "Python",
        "C++",
        "mmWave Radar",
        "ESP32 / FreeRTOS",
        "ROS 2",
        "MongoDB",
        "Gemini AI",
        "ElevenLabs",
        "OpenWRT"
      ],
      "summary": "ðŸ† Winner at ConUHacks X â€” Best Use of ElevenLabs (Jan 2026). Co-founded an on-premises AI nurse assistant for Quebec long-term care facilities (CHSLDs). Falls among seniors (65+) have risen 47% between 2008â€“2019 â€” Nursie closes the gap between unwitnessed falls and delayed staff response. What it does: (1) detects falls using mmWave radar (IWR6843) fused with a floor vibration mat; (2) tracks room context via magnetic door sensor + PIR presence/occupancy node on ESP32/FreeRTOS; (3) monitors vital signs via smartwatch integration; (4) sends immediate alerts â€” phone call + dashboard push â€” to staff on detection; (5) builds a resident profile in MongoDB over time to flag unusual behavior (e.g. leaving the apartment at night); (6) provides a voice interface for residents via ElevenLabs for questions, appointment reminders, and medication prompts. Design principles: fast reliable detection over fancy features; 3Ã— sensor redundancy to reduce false positives (radar + vibration mat + wearable fused for confidence scoring); privacy by architecture â€” all data stays on the facility's local OpenWRT LAN, no cameras, no cloud.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1",
        "demo": "https://devpost.com/software/nursie"
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDAS80X_XNEuUFS6k-WwWNK4ujFPPuUxPpWvmTVpU1JR5SivSd5oUG2JcVNgHI4epz7XEJI6N7eCpY_5koJUANuAI1BYhptkTPhdi5UGO2lM2yHA1--6_Zdhkuwaf4AXh47aYn5TOW2B8af31QajqbXwz4Ldn2XPUjvQPK0SasCQYVwEJls5ZWv-YsDYabLJ6PaUZtolG1ufVsJARGvsPWji9-J_dMGuf0kpNNEYucYBsS8AG3SpRwrHKSZrvL4alOKLEcgHbwa7a7w",
        "logo": null
      }
    },
    {
      "id": "P-9",
      "type": "project",
      "category": "Software & AI",
      "title": "CRM Outreach Tool",
      "subtitle": "Accenture Â· AOTC 2026 Â· Marâ€“Apr 2026",
      "status": "active",
      "order": 1,
      "skills": [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Gemini AI",
        "Resend",
        "Apollo.io",
        "Google Sheets API"
      ],
      "summary": "Fully integrated CRM outreach tool built for a Montreal urban agriculture cooperative (La Centrale Agricole), developed as part of Accenture's AOTC 2026 program. Manages contact lists across 3 audience segments (corporate, schools, institutions & media). Uses Google Gemini AI to generate personalized cold emails tailored to each contact's name, title, and organization â€” then sends them directly through the app. Tracks every contact through the full sales pipeline, syncs all data to Google Sheets in real time, and centralizes booking requests with auto-calculated revenue estimates. Team can accept, refuse, or cancel reservations â€” triggering a professional email to the client instantly. Total running cost: ~$0/month on free tiers.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1/Fully-Integrated-CRM-Tool",
        "demo": "https://www.youtube.com/watch?v=TVuFauDyA00"
      },
      "media": {
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAq3y0pe5-zj445NQYKmzbJNwSt6pwKm-RRaSroWdOsq0I9WvDU4tlIf_le6clLEAU1EU_s99pamo_RefOqMxhNv1gYMTs8tPSds7Jkb4ZRhxpEU9UQElEzVJSAoqViv4qiKxxL8YG9QR_aSkWObExq5swckGUTYd52SXI-msGM0W3mwkQaAm_mq0ahm8uaF08K-nIl5jUrIwBV32yVovAyJQHnlDfbkAO7aB-NtTFoGg_DNNFBe_PUARobX_wFyaL9hpiLkuNQrBNF",
        "logo": null
      }
    },
    {
      "id": "P-12",
      "type": "project",
      "category": "Software & AI",
      "title": "LazyCare",
      "subtitle": "UdemHacks Â· Mar 2025 Â· AI Health Assistant",
      "status": "active",
      "order": 2,
      "skills": [
        "Next.js",
        "Node.js",
        "Express",
        "Python",
        "FastAPI",
        "Fine-tuning",
        "TinyLlama",
        "AI"
      ],
      "summary": "Built at UdemHacks (Mar 2025). LazyCare is an AI health assistant that provides personalized health recommendations via text-based interactions. Backend stack: Next.js frontend, Node.js/Express middleware, and a Python FastAPI service running a fine-tuned TinyLlama model for domain-specific health analysis. Fine-tuning allows the model to give more accurate, context-aware answers than a vanilla LLM. Features: personalized profile management, AI chat interface, and full conversation history so the assistant learns your context over time.",
      "links": {
        "github": "https://github.com/Karencheenn/LazyCare",
        "demo": null
      },
      "media": {
        "image": null,
        "logo": null
      }
    },
    {
      "id": "P-13",
      "type": "project",
      "category": "Software & AI",
      "title": "Interview Assistant",
      "subtitle": "Brebeuf Hacks Â· Jan 2024 Â· Voice AI",
      "status": "active",
      "order": 3,
      "skills": [
        "Python",
        "NLP",
        "Voice AI",
        "API Integration",
        "Natural Language Processing"
      ],
      "summary": "Built at Brebeuf Hacks (Jan 2024) in a team of 3. A voice-based virtual interviewing assistant designed to help computer science students prepare for technical interviews. The assistant presents personalized interview questions verbally, listens to the interviewee's response, and evaluates the answer using natural language processing algorithms. Developed with Python and integrated an AI/NLP API to power the intelligent question-and-answer pipeline. Features a user-friendly voice interface so students can practice in a realistic spoken-word format rather than typing.",
      "links": {
        "github": "https://github.com/Louiszhang2005-1/Virtual_interviewing_assistant",
        "demo": null
      },
      "media": {
        "image": null,
        "logo": null
      }
    }
  ]
} as const;

export type PortfolioData = typeof portfolioData;

export const internships = portfolioData.internships;
export const projects = portfolioData.projects;
export const allPortfolioItems = portfolioData.allItems;

