# Louis Zhang portfolio: rules for every agent

Read this before you start. Run the **Finish checklist** below before you report any task as done.
The live site is https://www.louiszhang.app. Pushing to `main` deploys it to production through Vercel,
so only push to `main` when Louis has said to.

## Where things are

- App: `portfolio/` (npm workspace; root `package.json` runs it). Next.js 16.4.6, React 19, Tailwind v4,
  three + @react-three/fiber 9 + drei 10. This Next.js differs from older versions: read
  `portfolio/node_modules/next/dist/docs/` (see `portfolio/AGENTS.md`) before changing Next APIs.
- Homepage (3D device scroll story): `portfolio/src/components/prototype/`. Wins, community, scholarships
  and "Also built at" data live in `prototype/projectData.ts`; the cards render in `prototype/WinsChapter.tsx`.
- Driving game `/game`: `portfolio/src/components/drive/`. Stops are built server-side in `drive/driveData.ts`.
- Case studies `/portfolio/<slug>`: data in `portfolio/src/data/portfolio.json`, hydrated by `portfolio/src/lib/portfolio.ts`.
- Logos: `portfolio/public/logo/`. Game screen cards and previews: `portfolio/public/media/drive/`.
- Security headers and the Content-Security-Policy: `portfolio/next.config.ts`. Scripts, workers and
  blobs are limited to the site itself, so any new external script, font or CDN must be added there.
- Code map: `graphify-out/GRAPH_REPORT.md` (communities, central files) and `graphify-out/graph.html`
  (open in a browser). Use it to find what a change touches before editing.

## Content rules (facts must match everywhere)

The homepage and the game state the same facts. When you change one, change the other
(`prototype/projectData.ts` and `drive/driveData.ts`), and the case study data if it is there too.

- Show "Open to 2027 internship opportunities". Never show job-application or offer numbers.
  No résumé PDF and no graduation date.
- The CSA project is "Lunar Transport System" (LEAP is the program, not the project name).
- GDG: "VP Events", Google Developer Group on Campus, Polytechnique Montréal, Jan.–Apr. 2026.
- Accenture: Apprenticeship, "Accent on the Community" (pro-bono consulting), Jan.–Apr. 2026. The team
  built the CRM Outreach Tool "for a community of agriculture startups". Never name the client.
- Judging: MPC Hacks (May 2026) and Hack Découverte by HackConcordia (Nov. 2026).
  Guest speaker: SCS Concordia (Oct. 2026), a talk on landing tech internships to 100 students.
- Scholarships: Bourse Perspective Québec, Government of Québec, $20,000. Lina & Jean-Guy Gaudreault
  Perseverance Scholarship, Polytechnique Montréal, $2,500.
- Internships: Tesla, Lockheed Martin, City of Montréal (dates come from `portfolio/src/data/gameContact.ts`).
- Abbreviated months take a period: Jan., Feb., Aug., Oct., Nov. "May", "June" and "July" are not abbreviated.
- "Beyond the hackathons" is ordered newest first.

## Design rules

- No "AI-looking" pill or bubble UI. Prefer crisp cards, real logos, clear hierarchy.
- Logo tiles: a logo that is light or sits on its own dark background gets a dark tile it fills;
  a dark or coloured logo gets a white tile.
- Text in the game must never be covered: district names live in the HUD, not in the 3D world; signs
  and ground text stay off pads, roads with lamps, and props.
- Accessibility: WCAG 2.2 AA. Text contrast at least 4.5:1, every control reachable by keyboard,
  touch targets at least 44px on phones, respect `prefers-reduced-motion`.
- Game performance: no per-frame React state (write to `drive/driveStore.ts`), instanced meshes,
  DPR capped at 1.5, the 3D chunk loads lazily. Keep draw calls near 50.

## Game behaviour that must keep working

- The welcome card: Enter, Space or Esc closes it; W/A/S/D or the arrow keys start driving and close it.
- Enter at a stop opens its case study. M opens the map, Esc or M closes it, focus returns to the button.
- Phones: drag anywhere to drive; Map, List and Reset buttons are at least 44px.
- Reduced motion still gets the game (no camera shake); the list view is one tap away; no WebGL falls back to the list.

## Finish checklist (run all of it before saying "done")

Run from the repo root unless noted:

1. `npx tsc --noEmit -p portfolio`
2. `cd portfolio && npx eslint src/app src/components/prototype src/components/portfolio src/components/drive src/lib src/data` (0 errors)
3. `npm run build`
4. Start the production build (`cd portfolio && npx next start -p 3100`) and check these return the
   expected status: `/` 200, `/game` 200, `/classic` 200, `/portfolio/trace` 200,
   `/portfolio/does-not-exist` 404, `/media/portfolio-pages/portfolio.pdf` 200
   (the same list as `.github/workflows/ci.yml`).
5. Look at every page you changed in a real browser, on desktop (1440px wide) and on a phone (390px wide).
   For game changes also test: welcome card (Enter skips, W drives), the map (M, Esc), Enter at a stop.
6. Accessibility scan with axe-core (WCAG 2.2 AA) on `/`, a case study, and `/game`, desktop and phone:
   0 violations.
7. Check the content rules above, including that the homepage and the game agree.
8. If you added, moved or renamed files, refresh the code map: `graphify update portfolio/src`.
9. Commit on a branch. Push to `main` only after Louis approves; then confirm the GitHub Actions run
   passed and the change is live.
