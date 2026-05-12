# Louis Zhang — Portfolio Data

> Canonical source: `portfolio.json` (same directory). This file is the human-readable mirror.

---

## Internships

### ⚡ Tesla — Manufacturing Engineering Intern · Cell Engineering
**Period:** Summer 2026 & Fall 2026  
**Skills:** Manufacturing · Automation · Battery Cell Engineering · Python · Lean Six Sigma  
Incoming Manufacturing Engineering Intern at Tesla's Gigafactory, Cell Engineering department (Summer 2026 & Fall 2026). Focused on the 4680 battery cell manufacturing processes, production line optimization, and automation systems for next-gen energy storage.

---

### ✈️ Lockheed Martin — Engineering Intern
**Skills:** SOLIDWORKS · Engineering Drawings · VBA Programming · Windchill · Confluence  
Engineering Intern at Lockheed Martin. Specialized in 3D CAD modeling and structural design of ship components in SolidWorks — transforming engineering drawings into complete assemblies. Built VBA scripts to automate the peer-review process across several partner companies, improving overall turnaround time.

---

### 💧 City of Montreal — Scientific Intern · Water Department
**Period:** May–Aug 2025  
**Skills:** Data Analysis · Environmental Engineering · Python · GIS  
Scientific Intern at the City of Montreal's Water Department. Contributed to water quality monitoring initiatives and geospatial data pipelines for municipal infrastructure management.

---

## Aerospace & Mechanical Projects

### 🌕 CSA Lunar LEAP — PM & Systems Integrator
**Event:** Canadian Space Agency LEAP — OASIS Mission  
**Period:** Jan–May 2025 · Polytechnique Montréal  
**Skills:** CATIA V6 · Fusion 360 · GD&T · MS Project · Cold Welding · Systems Integration · FEA · Arduino · Raspberry Pi Pico  
**GitHub:** https://github.com/Louiszhang2005-1

PM & Systems Integrator for the Canadian Space Agency LEAP — OASIS Mission (Jan–May 2025, Polytechnique Montréal). Directed end-to-end design of a 3.1 m telescopic lunar produce-transport tube (Ø540 mm, 3080 mm deployed length), fully compliant with CSA performance and safety standards.

- Managed 50+ part interfaces, achieving a 12% system mass reduction while sustaining a 2.5× structural safety factor
- Ran thermal FEA over the 14-day lunar night cycle, validating zero mechanical interference across the full telescopic deployment sweep
- Developed the rail-guided transport wagon's control logic on an Arduino microcontroller
- Designed and programmed a Raspberry Pi Pico–driven belt conveyor for seamless vegetable transfer from lunar greenhouse to habitat module
- Led physical integration: AL-6061 machining, MLI fabrication, PCB prototyping, wiring harnesses, and cold-welding of tab-to-tube joints

---

### ⚙️ Axial Piston Pump — Hydraulic System Design
**Period:** Nov–Dec 2024 · Polytechnique Montréal  
**Skills:** 3D CAD · SolidWorks · Mechanical Design · GD&T · Assembly Modeling  

3D CAD modeling project at Polytechnique Montréal (Nov–Dec 2024). Fully modeled a high-performance axial piston hydraulic pump from the ground up.

The assembly houses 9 individual piston assemblies — each comprising a piston and slipper pad — retained by a retaining plate and centered via a spherical nut. Optimized component geometry and assembly parameters for mechanical durability.

Produced a full exploded-view drawing with a bilingual French/English BOM following standard drafting conventions.

---

### 🌱 Reforestation Robot — RoboHacks
**Event:** RoboHacks · Feb 2025  
**Awards:** Unexpected Expedition Award · 5th Place Overall  
**Skills:** Arduino C++ · IR Sensors · Color Sensor · DC Motors · Recycled Materials  
**GitHub:** https://github.com/Louiszhang2005-1/RoboHacks-2025

Autonomous seed-planting robot built in 24 hours at RoboHacks (Feb 2025) using entirely recycled materials — cardboard chassis, plastic bottles, and a paper-engineered seed dispenser.

Coded the full navigation and dispensing sequence in C++ on Arduino: two IR sensors fused with a color sensor for line-following, a servo-actuated paper dispenser for timed seed placement. All electronics wired on a breadboard from scratch under competition conditions.

Won the Unexpected Expedition Award and placed 5th overall.

---

### 🔧 MechPrep — McHacks 13
**Event:** McHacks 13 · Jan 2026  
**Skills:** SolidWorks · Blender · React · Python · AI API · 3D Modeling · CAD Integration  
**Devpost:** https://devpost.com/software/mechie

An interactive interview prep platform tailored for mechanical and aerospace engineering students, built at McHacks 13 (Jan 2026).

Designed and modeled 3D components in SolidWorks and Blender, then integrated the CAD models into a React + Python web app to make them interactive and educational. An AI API generates and evaluates interview questions in real time.

Next steps: expand the question bank across more companies and offer a white-label tool for companies to build their own technical interview question sets.

---

## Robotics & IoT Projects

### 🏥 ResQ-Link — UpStart 2026
**Event:** UpStart 2026 · Feb 2026 · Polytechnique Montréal  
**Skills:** SolidWorks · Passive NFC · IP68 Design · PCB Prototyping · Next.js · Medical Design · Systems Architecture  
**GitHub:** https://github.com/Louiszhang2005-1/Band

In Montreal, analog paper triage tags contribute to a 30% triage error rate, $1.7B in annual malpractice losses, and 10.5-hour average ER wait times. ResQ-Link replaces paper tags with a zero-power passive NFC bracelet.

- Inductive copper coil (no battery required), passive NFC chip, IP68 medical-grade silicone band with translucent overmolded seal
- SmartTriage companion dashboard — real-time bracelet location maps, tag management (Morgue / Immediate / Delayed / Minor), registered staff tracking
- Offline-mesh data sync so patient data reaches the hospital even when cellular fails
- Business model: hardware 'Blade' at $1.50/unit + software 'Razor' SaaS at $10k–$50k/facility/year

Targeting a $750k seed round for a MUHC 5,000-unit pilot, with Health Canada Class I/II certification and Quebec 'Buy Local' procurement priority.

---

### 🏆 Nursie — ConUHacks X
**Event:** ConUHacks X · Jan 2026  
**Awards:** Best Use of ElevenLabs  
**Skills:** Python · C++ · mmWave Radar · ESP32 / FreeRTOS · ROS 2 · MongoDB · Gemini AI · ElevenLabs · OpenWRT  
**GitHub:** https://github.com/Louiszhang2005-1  
**Devpost:** https://devpost.com/software/nursie

On-premises AI nurse assistant for Quebec long-term care facilities (CHSLDs), built at ConUHacks X (Jan 2026).

Falls among seniors (65+) have risen 47% between 2008 and 2019 — Nursie closes the gap between unwitnessed falls and delayed staff response.

- Detects falls using mmWave radar (IWR6843) fused with a floor vibration mat
- Tracks room context via magnetic door sensor + PIR presence node on ESP32/FreeRTOS
- Monitors vital signs via smartwatch integration
- Sends immediate alerts — phone call + dashboard push — to staff on detection
- Builds a resident profile in MongoDB over time to flag unusual behavior
- Provides a voice interface for residents via ElevenLabs for questions, appointment reminders, and medication prompts

Designed for 3× sensor redundancy to reduce false positives. Privacy by architecture — all data stays on the facility's local OpenWRT LAN, no cameras, no cloud. Won Best Use of ElevenLabs at ConUHacks X.

---

## Software & AI Projects

### 👁️ Saight — DeltaHacks X
**Event:** DeltaHacks X  
**Awards:** Winner  
**Skills:** Computer Vision · AI · Mobile Development · Accessibility  
**GitHub:** https://github.com/Louiszhang2005-1

AI-powered assistive technology for the visually impaired. Uses a smartphone-mapped white cane for navigation, providing real-time audio feedback about surroundings and obstacles. Built with computer vision and spatial mapping.

---

### 🛰️ STARSCAN.AI — AI Document Analysis
**Skills:** AI · NLP · NASA APIs · React · Python  
**GitHub:** https://github.com/Louiszhang2005-1

AI-powered system designed to analyze technical and scientific documents, including NASA documentation. Uses advanced NLP to extract insights, cross-reference data, and generate summaries from complex engineering specs and research papers.

---

### 🎮 LingoBattles — ConUHacks IX
**Event:** ConUHacks IX · Jan 2024  
**Skills:** React · WebSockets · Real-time Multiplayer · Game Design  
**GitHub:** https://github.com/Louiszhang2005-1

A fast-paced, real-time competitive party game for language learning. Players battle head-to-head in timed vocabulary challenges with live leaderboards and particle effects.

---

### 🤖 CRM Outreach Tool — Accenture AOTC 2026
**Event:** Accenture AOTC 2026  
**Period:** Mar–Apr 2026  
**Skills:** Next.js · React · TypeScript · Tailwind CSS · Gemini AI · Resend · Apollo.io · Google Sheets API  
**GitHub:** https://github.com/Louiszhang2005-1/Fully-Integrated-CRM-Tool  
**Demo:** https://www.youtube.com/watch?v=TVuFauDyA00

Fully integrated CRM outreach tool built for La Centrale Agricole, a Montreal urban agriculture cooperative, as part of Accenture's AOTC 2026 program.

- Manages contact lists across 3 audience segments (corporate, schools, institutions & media)
- Uses Google Gemini AI to generate personalized cold emails tailored to each contact's name, title, and organization — then sends them directly through the app
- Tracks every contact through the full sales pipeline with real-time Google Sheets sync
- Centralizes booking requests with auto-calculated revenue estimates — accept, refuse, or cancel reservations with one click, triggering a professional email to the client instantly

Total running cost: ~$0/month on free tiers.

---

### 💊 LazyCare — UdemHacks
**Event:** UdemHacks · Mar 2025  
**Skills:** Next.js · Node.js · Express · Python · FastAPI · Fine-tuning · TinyLlama · AI  
**GitHub:** https://github.com/Karencheenn/LazyCare

AI health assistant that provides personalized health recommendations via text-based interactions.

Backend stack: Next.js frontend, Node.js/Express middleware, and a Python FastAPI service running a fine-tuned TinyLlama model for domain-specific health analysis. Fine-tuning allows the model to give more accurate, context-aware answers than a vanilla LLM.

Features: personalized profile management, AI chat interface, and full conversation history so the assistant learns your context over time.

---

### 🎤 Interview Assistant — Brebeuf Hacks
**Event:** Brebeuf Hacks · Jan 2024  
**Skills:** Python · NLP · Voice AI · API Integration · Natural Language Processing  
**GitHub:** https://github.com/Louiszhang2005-1/Virtual_interviewing_assistant

Voice-based virtual interviewing assistant designed to help computer science students prepare for technical interviews, built at Brebeuf Hacks (Jan 2024) in a team of 3.

The assistant presents personalized interview questions verbally, listens to the response, and evaluates it using NLP algorithms. Built with Python and an AI/NLP API.

Features a realistic spoken-word interface so students can practice verbal answers, not just type them.
