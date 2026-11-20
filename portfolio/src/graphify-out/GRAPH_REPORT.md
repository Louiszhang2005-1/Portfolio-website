# Graph Report - src  (2026-11-20)

## Corpus Check
- 83 files · ~73,473 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 3, .ico 1)

## Summary
- 618 nodes · 1548 edges · 35 communities (31 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `257a79de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DeviceEcosystem.tsx
- 3D Device Screens & Callouts
- App Routes & Layout
- Projects & Wins Data
- Portfolio Book Deck
- Device Screen Parts
- Game Physics Toys
- Portfolio Content (Projects & Internships)
- Classic Portfolio Page
- Game State Store & Map
- portfolio.ts
- Legacy Landing Hero
- Voxel Name & World Layout
- Car & Game Scene
- Case Study Page & Footer
- Game Landmarks
- Game Text Labels
- Game Showcase Screens
- Classic Project Cards
- Game Scenery Props
- Discovery Confetti
- WebGL Canvas & Fallback
- Orbit Gallery
- Portfolio Export Data
- stage.tsx
- Step Navigation
- Physics Constellation
- ProjectCaseStudy.tsx
- Projects Summary
- WatchChapter.tsx
- ExperienceChapter.tsx
- PhoneChapter.tsx
- layout.tsx
- portfolio/page.tsx

## God Nodes (most connected - your core abstractions)
1. `DriveScene()` - 22 edges
2. `Portfolio Data (human-readable mirror)` - 18 edges
3. `DeviceEcosystem()` - 16 edges
4. `Louis Zhang` - 16 edges
5. `WatchModel()` - 15 edges
6. `Phone()` - 14 edges
7. `PhoneModel()` - 14 edges
8. `DriveGame()` - 13 edges
9. `PortfolioHome()` - 13 edges
10. `useMap()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `ClassicHome()` --calls--> `PortfolioHome()`  [EXTRACTED]
  portfolio/src/app/classic/page.tsx → portfolio/src/components/portfolio/PortfolioHome.tsx
- `GamePage()` --calls--> `DriveGame()`  [EXTRACTED]
  portfolio/src/app/game/page.tsx → portfolio/src/components/drive/DriveGame.tsx
- `Home()` --calls--> `DeviceEcosystem()`  [EXTRACTED]
  portfolio/src/app/page.tsx → portfolio/src/components/prototype/DeviceEcosystem.tsx
- `DriveScene()` --calls--> `Confetti()`  [EXTRACTED]
  portfolio/src/components/drive/DriveScene.tsx → portfolio/src/components/drive/Confetti.tsx
- `DriveGame()` --calls--> `MapOverlay()`  [EXTRACTED]
  portfolio/src/components/drive/DriveGame.tsx → portfolio/src/components/drive/MapOverlay.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Internship experience** — portfolio_src_data_portfolio_tesla_internship, portfolio_src_data_portfolio_lockheed_martin_internship, portfolio_src_data_portfolio_city_of_montreal_internship [EXTRACTED 1.00]
- **Hardware/embedded projects** — portfolio_src_data_portfolio_lunar_transport_system, portfolio_src_data_portfolio_reforestation_robot, portfolio_src_data_portfolio_nursie, portfolio_src_data_portfolio_resq_link [INFERRED 0.75]
- **Healthcare-focused projects** — portfolio_src_data_portfolio_resq_link, portfolio_src_data_portfolio_nursie, portfolio_src_data_portfolio_lazycare [INFERRED 0.85]

## Communities (35 total, 4 thin omitted)

### Community 0 - "DeviceEcosystem.tsx"
Cohesion: 0.14
Nodes (17): Home(), metadata, ChapterNav(), chapters, ContactFooter(), DeviceEcosystem(), FooterRecap(), RECAP (+9 more)

### Community 1 - "3D Device Screens & Callouts"
Cohesion: 0.10
Nodes (56): canvasTexture(), logicalSize(), useScreen(), Callout(), CalloutLayout(), CalloutRef, calloutsShown(), clamp01() (+48 more)

### Community 2 - "App Routes & Layout"
Cohesion: 0.09
Nodes (30): GamePage(), metadata, world, buildWorld(), CLUSTERS, INTERNSHIP_SPOTS, Stop, StopKind (+22 more)

### Community 3 - "Projects & Wins Data"
Cohesion: 0.09
Nodes (32): allProjects, ALSO_COMPETED, COMMUNITY, DRAWINGS, FOCUS, FRAMING, Group, groupById (+24 more)

### Community 4 - "Portfolio Book Deck"
Cohesion: 0.12
Nodes (32): BookDeck(), clamp01(), Cover(), EndPaper(), FlatSpread(), near(), Page(), pageSrc() (+24 more)

### Community 5 - "Device Screen Parts"
Cohesion: 0.14
Nodes (29): AppIcon(), apps, clamp01(), code, CodeScreen(), dock, easeInOut(), Layer() (+21 more)

### Community 6 - "Game Physics Toys"
Cohesion: 0.11
Nodes (26): AXIS, Body, bodyTransform(), bowl, Bowling, createBodies(), knock(), SPEC (+18 more)

### Community 7 - "Portfolio Content (Projects & Internships)"
Cohesion: 0.15
Nodes (25): Portfolio Data (human-readable mirror), Arduino, Axial Piston Pump - Hydraulic System Design, City of Montreal Engineering Intern - Water Department, CRM Outreach Tool - Accenture AOTC 2026, Fine-tuned TinyLlama, Gemini AI, Interview Assistant - Brebeuf Hacks (+17 more)

### Community 8 - "Classic Portfolio Page"
Cohesion: 0.13
Nodes (15): ClassicHome(), metadata, About(), skills, Contact(), FullPortfolioDeck(), GamePortalDashboard(), telemetry (+7 more)

### Community 9 - "Game State Store & Map"
Cohesion: 0.13
Nodes (19): CAR_RADIUS, StepResult, fl, Listener, listeners, SCREEN_RIGHT, SCREEN_UP, SPAWN (+11 more)

### Community 10 - "portfolio.ts"
Cohesion: 0.18
Nodes (11): clean(), fullPortfolioDocument, fullPortfolioPages, hiddenSkillItemIds, hydrate(), mediaById, RawPortfolioItem, rawProjects (+3 more)

### Community 11 - "Legacy Landing Hero"
Cohesion: 0.15
Nodes (15): SprocketAvatar(), SprocketAvatarProps, ActivePanel, routes, stars, VoyageBackdrop(), VoyageBackdropProps, credibilitySignals (+7 more)

### Community 12 - "Voxel Name & World Layout"
Cohesion: 0.20
Nodes (13): createNameSim(), NameBlocks(), NameCubes, tmp, buildNameCubes(), buildScenery(), CUBE, distToSegment() (+5 more)

### Community 13 - "Car & Game Scene"
Cohesion: 0.24
Nodes (15): Car(), resetCar(), resolveControls(), stepCar(), wrap(), AdaptiveResolution(), DriveScene(), Ready() (+7 more)

### Community 14 - "Case Study Page & Footer"
Cohesion: 0.23
Nodes (6): CinematicFooter(), MagneticButton, MagneticButtonProps, MarqueeItem(), ProjectCardProps, cn()

### Community 15 - "Game Landmarks"
Cohesion: 0.24
Nodes (13): CAMERA_YAW, col, Exhibits(), ICON_SHAPES, Landmarks(), LogoBoard(), Mailbox(), Offices() (+5 more)

### Community 16 - "Game Text Labels"
Cohesion: 0.21
Nodes (13): District, CAMERA_OFFSET, signAnchor(), AtlasCell, createAtlas(), drawCell(), fit(), LabelSpec (+5 more)

### Community 17 - "Game Showcase Screens"
Cohesion: 0.27
Nodes (9): Screen, SCREEN_BACK, SCREEN_BASE, SCREEN_H, SCREEN_W, OFF, Panel(), Showcases() (+1 more)

### Community 18 - "Classic Project Cards"
Cohesion: 0.29
Nodes (8): categories, Projects(), ProjectCard, ProjectShowcase(), ProjectShowcaseProps, featuredProjects, PortfolioItem, projects

### Community 19 - "Game Scenery Props"
Cohesion: 0.29
Nodes (10): color, placeCrown(), placeRock(), placeTrunk(), Props(), tintCrown(), tintRock(), tmp (+2 more)

### Community 20 - "Discovery Confetti"
Cohesion: 0.18
Nodes (11): carFx, tmp, WHEELS, Bit, col, Confetti(), createBits(), tmp (+3 more)

### Community 21 - "WebGL Canvas & Fallback"
Cohesion: 0.36
Nodes (5): markThreeReady(), DeviceCanvas(), ReadySignal(), reportLost(), WebGLBoundary

### Community 22 - "Orbit Gallery"
Cohesion: 0.27
Nodes (7): ProjectOrbitGallery(), sections, sectionTones, CircularGallery, CircularGalleryProps, cn(), GalleryItem

### Community 23 - "Portfolio Export Data"
Cohesion: 0.29
Nodes (6): allPortfolioItems, internships, portfolioData, PortfolioData, PortfolioItem, projects

### Community 24 - "stage.tsx"
Cohesion: 0.20
Nodes (13): BeatCopy(), btn, btnGhostDark, btnPrimaryDark, CONTACT, hasWebGL(), HeroName(), OpenTo() (+5 more)

### Community 25 - "Step Navigation"
Cohesion: 0.47
Nodes (5): Chapter, ease(), readStops(), StepNav(), Stop

### Community 26 - "Physics Constellation"
Cohesion: 0.60
Nodes (4): Body, LoadingSkeleton(), noop(), PhysicsConstellation()

### Community 27 - "ProjectCaseStudy.tsx"
Cohesion: 0.21
Nodes (13): dynamicParams, generateMetadata(), PageProps, PortfolioDetailPage(), darken(), Kicker(), LinkIcon(), ProjectCaseStudy() (+5 more)

### Community 30 - "WatchChapter.tsx"
Cohesion: 0.18
Nodes (13): DeviceSkeleton(), ReadyWindow, SHAPES, useThreeReady(), AVAILABILITY, DeviceStage(), holdStops(), beats (+5 more)

### Community 31 - "ExperienceChapter.tsx"
Cohesion: 0.21
Nodes (14): clamp(), ExperienceChapter(), HOLDS, jobs, Laptop3D, paragraphs(), PinnedRoles(), RoleDetails() (+6 more)

### Community 32 - "PhoneChapter.tsx"
Cohesion: 0.19
Nodes (12): Motion, beats, DepthHud(), disciplines, diveAt(), HOLDS, Phone3D, PhoneChapter() (+4 more)

## Knowledge Gaps
- **4 isolated node(s):** `summary`, `Fine-tuned TinyLlama`, `SmartTriage Dashboard`, `portfolio.json (canonical source)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 172 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Portfolio Data (human-readable mirror)` connect `Portfolio Content (Projects & Internships)` to `portfolio.ts`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `summary`, `Fine-tuned TinyLlama`, `SmartTriage Dashboard` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DeviceEcosystem.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._
- **Should `3D Device Screens & Callouts` be split into smaller, more focused modules?**
  _Cohesion score 0.10402532790592492 - nodes in this community are weakly interconnected._
- **Should `App Routes & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.09365079365079365 - nodes in this community are weakly interconnected._
- **Should `Projects & Wins Data` be split into smaller, more focused modules?**
  _Cohesion score 0.0859465737514518 - nodes in this community are weakly interconnected._
- **Should `Portfolio Book Deck` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._