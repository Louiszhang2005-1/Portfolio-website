# Graph Report - src  (2026-11-20)

## Corpus Check
- 85 files · ~73,430 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 3, .ico 1)

## Summary
- 617 nodes · 1546 edges · 30 communities (28 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.84)
- Token cost: 0 input · 90,273 output

## Community Hubs (Navigation)
- Homepage Shell & Chapters
- 3D Device Screens & Callouts
- App Routes & Layout
- Projects & Wins Data
- Portfolio Book Deck
- Device Screen Parts
- Game Physics Toys
- Portfolio Content (Projects & Internships)
- Classic Portfolio Page
- Game State Store & Map
- Case Study Routing & Data
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
- Car Physics
- Step Navigation
- Physics Constellation
- Classic Hero
- Projects Summary

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
  app/classic/page.tsx → components/portfolio/PortfolioHome.tsx
- `GamePage()` --calls--> `DriveGame()`  [EXTRACTED]
  app/game/page.tsx → components/drive/DriveGame.tsx
- `Home()` --calls--> `DeviceEcosystem()`  [EXTRACTED]
  app/page.tsx → components/prototype/DeviceEcosystem.tsx
- `PortfolioDetailPage()` --calls--> `ProjectCaseStudy()`  [EXTRACTED]
  app/portfolio/[slug]/page.tsx → components/portfolio/ProjectCaseStudy.tsx
- `ProjectCard` --calls--> `cn()`  [EXTRACTED]
  components/ui/project-card.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Internship experience** — data_portfolio_tesla_internship, data_portfolio_lockheed_martin_internship, data_portfolio_city_of_montreal_internship [EXTRACTED 1.00]
- **Healthcare-focused projects** — data_portfolio_resq_link, data_portfolio_nursie, data_portfolio_lazycare [INFERRED 0.85]
- **Hardware/embedded projects** — data_portfolio_lunar_transport_system, data_portfolio_reforestation_robot, data_portfolio_nursie, data_portfolio_resq_link [INFERRED 0.75]

## Communities (30 total, 2 thin omitted)

### Community 0 - "Homepage Shell & Chapters"
Cohesion: 0.05
Nodes (74): Home(), metadata, ChapterNav(), chapters, ContactFooter(), DeviceEcosystem(), FooterRecap(), RECAP (+66 more)

### Community 1 - "3D Device Screens & Callouts"
Cohesion: 0.10
Nodes (56): canvasTexture(), logicalSize(), useScreen(), Callout(), CalloutLayout(), CalloutRef, calloutsShown(), clamp01() (+48 more)

### Community 2 - "App Routes & Layout"
Cohesion: 0.06
Nodes (32): GamePage(), metadata, world, metadata, viewport, metadata, buildWorld(), CLUSTERS (+24 more)

### Community 3 - "Projects & Wins Data"
Cohesion: 0.09
Nodes (30): allProjects, ALSO_COMPETED, COMMUNITY, DRAWINGS, FOCUS, FRAMING, Group, groupById (+22 more)

### Community 4 - "Portfolio Book Deck"
Cohesion: 0.12
Nodes (31): BookDeck(), clamp01(), Cover(), EndPaper(), FlatSpread(), near(), Page(), pageSrc() (+23 more)

### Community 5 - "Device Screen Parts"
Cohesion: 0.14
Nodes (28): AppIcon(), apps, clamp01(), code, CodeScreen(), dock, easeInOut(), Layer() (+20 more)

### Community 6 - "Game Physics Toys"
Cohesion: 0.11
Nodes (26): AXIS, Body, bodyTransform(), bowl, Bowling, createBodies(), knock(), SPEC (+18 more)

### Community 7 - "Portfolio Content (Projects & Internships)"
Cohesion: 0.15
Nodes (25): Portfolio Data (human-readable mirror), Arduino, Axial Piston Pump - Hydraulic System Design, City of Montreal Engineering Intern - Water Department, CRM Outreach Tool - Accenture AOTC 2026, Fine-tuned TinyLlama, Gemini AI, Interview Assistant - Brebeuf Hacks (+17 more)

### Community 8 - "Classic Portfolio Page"
Cohesion: 0.13
Nodes (16): ClassicHome(), metadata, About(), skills, Contact(), FullPortfolioDeck(), GamePortalDashboard(), telemetry (+8 more)

### Community 9 - "Game State Store & Map"
Cohesion: 0.14
Nodes (17): CAMERA_OFFSET, fl, Listener, listeners, SCREEN_RIGHT, SCREEN_UP, SPAWN, visited (+9 more)

### Community 10 - "Case Study Routing & Data"
Cohesion: 0.13
Nodes (18): dynamicParams, generateMetadata(), PageProps, PortfolioDetailPage(), allPortfolioItems, clean(), featuredProjects, getPortfolioItemBySlug() (+10 more)

### Community 11 - "Legacy Landing Hero"
Cohesion: 0.15
Nodes (15): SprocketAvatar(), SprocketAvatarProps, ActivePanel, routes, stars, VoyageBackdrop(), VoyageBackdropProps, credibilitySignals (+7 more)

### Community 12 - "Voxel Name & World Layout"
Cohesion: 0.16
Nodes (16): CAR_RADIUS, createNameSim(), NameBlocks(), NameCubes, tmp, buildNameCubes(), buildScenery(), Circle (+8 more)

### Community 13 - "Car & Game Scene"
Cohesion: 0.21
Nodes (15): Car(), carFx, tmp, WHEELS, AdaptiveResolution(), DriveScene(), Ready(), Simulation() (+7 more)

### Community 14 - "Case Study Page & Footer"
Cohesion: 0.21
Nodes (10): Kicker(), LinkIcon(), ProjectCaseStudy(), Reveal(), WordsPullUp(), CinematicFooter(), MagneticButton, MagneticButtonProps (+2 more)

### Community 15 - "Game Landmarks"
Cohesion: 0.24
Nodes (13): CAMERA_YAW, col, Exhibits(), ICON_SHAPES, Landmarks(), LogoBoard(), Mailbox(), Offices() (+5 more)

### Community 16 - "Game Text Labels"
Cohesion: 0.26
Nodes (11): signAnchor(), AtlasCell, createAtlas(), drawCell(), fit(), LabelSpec, roundRect(), fontsReady() (+3 more)

### Community 17 - "Game Showcase Screens"
Cohesion: 0.27
Nodes (9): Screen, SCREEN_BACK, SCREEN_BASE, SCREEN_H, SCREEN_W, OFF, Panel(), Showcases() (+1 more)

### Community 18 - "Classic Project Cards"
Cohesion: 0.29
Nodes (7): categories, Projects(), ProjectCard, ProjectCardProps, ProjectShowcase(), ProjectShowcaseProps, PortfolioItem

### Community 19 - "Game Scenery Props"
Cohesion: 0.33
Nodes (9): color, placeCrown(), placeRock(), placeTrunk(), Props(), tintCrown(), tintRock(), tmp (+1 more)

### Community 20 - "Discovery Confetti"
Cohesion: 0.28
Nodes (7): Bit, col, Confetti(), createBits(), tmp, driveStore, PALETTE

### Community 21 - "WebGL Canvas & Fallback"
Cohesion: 0.36
Nodes (5): markThreeReady(), DeviceCanvas(), ReadySignal(), reportLost(), WebGLBoundary

### Community 22 - "Orbit Gallery"
Cohesion: 0.43
Nodes (5): ProjectOrbitGallery(), CircularGallery, CircularGalleryProps, cn(), GalleryItem

### Community 23 - "Portfolio Export Data"
Cohesion: 0.29
Nodes (6): allPortfolioItems, internships, portfolioData, PortfolioData, PortfolioItem, projects

### Community 24 - "Car Physics"
Cohesion: 0.60
Nodes (5): resetCar(), resolveControls(), stepCar(), StepResult, wrap()

### Community 25 - "Step Navigation"
Cohesion: 0.47
Nodes (5): Chapter, ease(), readStops(), StepNav(), Stop

### Community 26 - "Physics Constellation"
Cohesion: 0.60
Nodes (4): Body, LoadingSkeleton(), noop(), PhysicsConstellation()

### Community 27 - "Classic Hero"
Cohesion: 0.50
Nodes (4): navItems, PortfolioHero(), WordsPullUp(), WordsPullUpProps

## Knowledge Gaps
- **4 isolated node(s):** `summary`, `portfolio.json (canonical source)`, `SmartTriage Dashboard`, `Fine-tuned TinyLlama`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 172 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Portfolio Data (human-readable mirror)` connect `Portfolio Content (Projects & Internships)` to `Case Study Routing & Data`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `summary`, `portfolio.json (canonical source)`, `SmartTriage Dashboard` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Homepage Shell & Chapters` be split into smaller, more focused modules?**
  _Cohesion score 0.05417236662106703 - nodes in this community are weakly interconnected._
- **Should `3D Device Screens & Callouts` be split into smaller, more focused modules?**
  _Cohesion score 0.10402532790592492 - nodes in this community are weakly interconnected._
- **Should `App Routes & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.061224489795918366 - nodes in this community are weakly interconnected._
- **Should `Projects & Wins Data` be split into smaller, more focused modules?**
  _Cohesion score 0.08846153846153847 - nodes in this community are weakly interconnected._
- **Should `Portfolio Book Deck` be split into smaller, more focused modules?**
  _Cohesion score 0.11596638655462185 - nodes in this community are weakly interconnected._