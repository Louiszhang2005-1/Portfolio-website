# DESIGN.md

> A portfolio you scroll like a product launch: one device per chapter, machined type, real materials, one accent.

## 1. Visual Theme & Atmosphere

**Style**: Machined Product (premium consumer-electronics launch page)
**Keywords**: machined, studio-lit, material-honest, restrained, exploded-view, precise, cinematic pacing
**Tone**: confident engineering showcase — NOT neon "AI startup", NOT glassmorphism, NOT rainbow gradients
**Feel**: walking around a product on a turntable under one key light, then watching an engineer take it apart.

The page is **light throughout**, Apple/Stripe style: white chapters alternate with soft-grey (#f5f5f7) chapters, near-black type, a very low-contrast warm/cool wash behind each device. **Dark appears only on device screens** (and screen-like panels), the way real displays look. Scroll-driven motion runs through a spring so it glides rather than steps. Colour only ever comes from materials (aluminium, graphite glass, matte black PCB, gold pads) plus a single accent: **kapton orange**, the colour of flex cables.

**Interaction Tier**: L3 — scroll-driven timelines, pinned chapters, exploded views
**Dependencies**: framer-motion (already installed). No GSAP / Lenis: framer `useScroll` covers pin-scrub. WebGL: see Open decision in §7.

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #ffffff;               /* page (white chapters); --bg-light #f5f5f7 for grey chapters */
  --bg-light: #f5f5f7;         /* light spec-sheet chapters */
  --surface: #1c1d21;          /* cards on dark */
  --surface-alt: #222328;      /* raised cards on dark */
  --surface-hover: #2a2b31;
  --surface-light: #ffffff;    /* cards on light */

  /* Borders */
  --border: rgba(255, 255, 255, 0.10);
  --border-hover: rgba(255, 255, 255, 0.22);
  --border-light: rgba(0, 0, 0, 0.08);

  /* Text */
  --text: #f5f5f7;
  --text-secondary: #a1a1a6;
  --text-tertiary: #8e8e93;
  --text-on-light: #1d1d1f;
  --text-on-light-secondary: #6e6e73;

  /* Accent: kapton orange, interactive + callouts only */
  --accent: #d4842f;
  --accent-hover: #e3954a;
  --accent-ink: #1a0f04;       /* text on accent fills */
  --accent-on-light: #a35a14;  /* accent as text on light chapters (~5:1) */

  /* Materials (device rendering only, never UI chrome) */
  --mat-alu-hi: #ececef;
  --mat-alu-mid: #9a9aa0;
  --mat-alu-lo: #6c6c72;
  --mat-graphite: #1f1f22;
  --mat-pcb: #121214;
  --mat-trace: #7a5d27;
  --mat-gold: #c8a24c;
  --mat-led: #4ade80;
  --mat-kapton: #c97a2b;       /* flex cables: a material, separate from the UI accent */

  /* RGB variants for rgba() */
  --bg-rgb: 20, 21, 24;
  --bg-light-rgb: 245, 245, 247;
  --accent-rgb: 212, 132, 47;

  /* Semantic */
  --success: #30d158;
  --error: #ff453a;
  --warning: #ffd60a;
}
```

**Color Rules:**
- Every colour in components comes from these variables. Zero hard-coded hex in TSX.
- `--accent` appears only on: interactive elements (active nav, links, focus rings), part callout dots, award badges. Never as a background wash.
- `--mat-*` tokens are for drawing device parts. They never style UI chrome (buttons, nav, text).
- One accent per viewport. No second chromatic colour (the green sensor LEDs are a material, kept tiny).
- Page tokens are light. The `.on-dark` scope re-points --bg/--text/--border to the dark screen palette for device screens and screen-like panels only; the 3D screen textures read the same scope.

## 3. Typography Rules

**Font Stack:** one family, Archivo, used at two widths. Wide-set headlines read like the engraved markings on a device case; normal width carries body copy. A mono is reserved for engineering specs only.
```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..700&family=JetBrains+Mono:wght@400;500&display=swap');

--font-display: "Archivo", "Helvetica Neue", Arial, sans-serif;   /* with font-stretch: 118-125% */
--font-body: "Archivo", "Helvetica Neue", Arial, sans-serif;      /* font-stretch: 100% */
--font-mono: "JetBrains Mono", ui-monospace, Menlo, monospace;     /* specs only */
```

| Role | Font | Size | Weight | Width | Line Height | Letter Spacing |
|------|------|------|--------|-------|-------------|----------------|
| Hero H1 | Archivo | clamp(3.5rem, 7.5vw, 6.5rem) | 600 | 125% | 0.98 | -0.02em |
| Section H2 | Archivo | clamp(2.25rem, 4.5vw, 3.75rem) | 600 | 118% | 1.04 | -0.015em |
| H3 | Archivo | 1.5rem | 600 | 110% | 1.2 | -0.01em |
| Body | Archivo | 1.0625rem (17px) | 400 | 100% | 1.55 | 0 |
| Small / meta | Archivo | 0.875rem | 500 | 100% | 1.4 | 0 (sentence case) |
| Spec / callout | JetBrains Mono | 0.625rem | 400–500 | — | 1.4 | 0.14em, uppercase (drawing convention) |

**Typography Rules:**
- Width is the personality: headlines wide (118–125%), everything else normal. Never condense.
- Headings weight 600; never 800+.
- Uppercase only inside part callouts and spec rows (engineering-drawing convention). Navigation, labels and meta are sentence case.
- No eyebrow label above headings. A small line sits under a heading only when it carries information (dates, layer range).
- No single-word colour/italic accent inside headlines.
- Measurements use mono + `tabular-nums`.
- Body measure ≤ 70 characters.
- **NEVER use**: Inter / Inter Tight (default family), Plus Jakarta Sans ExtraBold, Space Grotesk, emoji as icons.

**Text Decoration:** none at any level. The product is the hero; type stays flat and precise.

## 4. Component Stylings

### Buttons
```css
.btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  min-height: 44px; padding: 0 1.25rem; border-radius: 980px;
  font: 500 0.9375rem/1 var(--font-body);
  background: var(--text); color: var(--bg);
  border: 1px solid transparent;
  transition: transform .2s ease, background-color .2s ease, opacity .2s ease;
}
.btn:hover { background: #ffffff; transform: translateY(-1px); }
.btn:active { transform: translateY(0) scale(0.98); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.btn:disabled { opacity: .4; pointer-events: none; }

.btn-ghost { background: transparent; color: var(--text); border-color: var(--border); }
.btn-ghost:hover { border-color: var(--border-hover); background: var(--surface); }
```

### Cards (project "product boxes")
```css
.product-box {
  border-radius: 20px; padding: 20px;
  background: var(--surface-light); color: var(--text-on-light);
  border: 1px solid var(--border-light);
  box-shadow: 0 1px 0 rgba(0,0,0,.03), 0 24px 48px -28px rgba(0,0,0,.28);
  transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s;
}
.product-box:hover { transform: translateY(-6px); box-shadow: 0 1px 0 rgba(0,0,0,.03), 0 36px 60px -28px rgba(0,0,0,.35); }
.product-box:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
.product-box[aria-current="true"] { transform: translateY(-14px); }
```

### Navigation
```css
.chapter-nav {
  position: fixed; inset: 0 0 auto 0; z-index: 40;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 24px;
  background: linear-gradient(rgba(var(--bg-rgb), .9), rgba(var(--bg-rgb), 0));
}
.chapter-nav[data-theme="light"] { background: linear-gradient(rgba(var(--bg-light-rgb), .9), rgba(var(--bg-light-rgb), 0)); }
.chapter-nav__pill { display: flex; gap: 2px; padding: 3px; border-radius: 980px; border: 1px solid var(--border); background: rgba(var(--bg-rgb), .5); backdrop-filter: blur(12px); }
.chapter-nav__item { min-height: 32px; padding: 0 14px; border-radius: 980px; font: 500 13px/1 var(--font-body); color: var(--text-secondary); }
.chapter-nav__item:hover { color: var(--text); }
.chapter-nav__item[aria-current="true"] { background: var(--text); color: var(--bg); }
.chapter-nav__item:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

### Links
```css
.link { color: var(--accent); text-decoration: none; background: linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat; transition: background-size .25s ease; }
.link:hover { background-size: 100% 1px; }
.link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
```

### Tags / Badges
```css
.tag { display: inline-flex; padding: 4px 10px; border-radius: 980px; border: 1px solid var(--border); font: 500 12px/1.2 var(--font-body); color: var(--text-secondary); }
.badge-award { padding: 4px 10px; border-radius: 980px; background: var(--accent); color: var(--accent-ink); font: 600 11px/1.2 var(--font-body); }
```

### Part callout (exploded views)
```css
.callout { display: flex; gap: 8px; align-items: flex-start; white-space: nowrap; }
.callout__leader { width: 64px; height: 1px; margin-top: 6px; background: var(--text-tertiary); }
.callout__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
.callout__name { font: 500 10px/1.3 var(--font-mono); letter-spacing: .16em; text-transform: uppercase; color: var(--text); }
.callout__spec { font: 400 9px/1.3 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-tertiary); }
```

## 5. Layout Principles

**Container:**
- Max width: 1200px
- Padding: 24px (mobile) / 40px (desktop)
- Narrow variant (copy column): 440px

**Radius Scale:** 4 (sm) · 6 (default) · 8 (md) · 10 (lg) · 14 (xl) · 18 (2xl) · 20–24 (product boxes, showcase) · 980px (pills). Scoped inside the prototype because the live site's theme uses 2rem/3rem for lg/xl.

**Spacing Scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128
- Chapter (pinned) height: 100vh sticky inside a 250–850vh track
- Component gap: 24px
- Card internal padding: 20px

**Grid:**
```css
.chapter-grid { display: grid; gap: 40px; align-items: center; grid-template-columns: 1fr; }
@media (min-width: 1024px) { .chapter-grid { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); } }
```
- Device always on the right on desktop, copy on the left; device above copy on mobile.
- The top bar owns the top 56px; pinned content never sits under it.

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | none | text, tags |
| Subtle | `0 1px 0 rgba(255,255,255,.06) inset` | dark cards, device bezels |
| Elevated | `0 24px 48px -28px rgba(0,0,0,.28)` | product boxes on light |
| Floating | `0 40px 60px -30px rgba(0,0,0,.6)` | hovered / front product box, laptop windows |
| Studio floor | blurred black ellipse under device, opacity .3–.55 | every device |
| Key light | `radial-gradient(60% 55% at 70% 0%, rgba(255,255,255,.09), transparent 70%)` | dark chapter backgrounds |

## 7. Animation & Interaction

**Motion Philosophy**: motion explains how the thing is built. Only `transform` and `opacity`; the device moves, the UI stays still.
**Tier**: L3

### Dependencies
framer-motion 12 (installed). `useScroll` + JS-mapped transforms (a `useMap` helper), never range-form `useTransform` on scroll progress (it is offloaded to a native scroll timeline that left fades stuck) and never array-input `useTransform` (combined values missed updates on scroll jumps).

### Entrance Animation
```css
@keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.rise { animation: rise .7s cubic-bezier(.2,.8,.2,1) both; }
```
- Hero H1: one per-word mask reveal on load (stagger 60ms). This is the only text animation on the page.

### Scroll Behavior (signature moments)
1. **Watch hero**: crown turns, notification slides in (pin-scrub).
2. **Watch teardown**: layers peel top-first with stagger, callouts appear (pin-scrub, converge/scatter).
3. **Phone teardown**: screws spin out, 8 layers explode, callouts float above the stack.
4. **Inside the phone**: stack tilts to 40% and layers lift + dissolve one by one; copy swaps per discipline (left pin / right swap).
5. **Laptop hinge**: lid opens from closed, screen powers on, one app window per role swaps on scroll (left pin / right swap).
6. **Lineup**: horizontal shelf scrub, front box lifts, filter tabs re-flow (component).
- Section H2s and labels do **not** animate on their own: the scroll-driven devices are the motion. (Deliberate deviation from the web-design skill's six-text-animation rule, per the frontend-design review: one orchestrated moment lands better than scattered effects.)

### Hover & Focus States
```css
a, button, [role="button"] { transition: color .2s, background-color .2s, border-color .2s, transform .2s; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
```

### Special Effects
- Background: studio key light + 3% film grain (static SVG noise, no animation).
- Idle float on devices (±8px, 6s) — the only looping motion on the page.
- Easter egg: the watch shows your real local time.

### 3D: react-three-fiber, one canvas
- three.js via @react-three/fiber 9 + drei 10. **One** fixed, pointer-transparent WebGL canvas for the whole page; each device chapter registers a drei `<View>` box, and off-screen views are not drawn.
- Devices (watch, phone, laptop) are **modelled in code** (extruded rounded slabs, real layer geometry): no downloaded model files, no licensing, and every layer can explode on its own.
- Lighting is an environment built from code `<Lightformer>` panels (no HDR fetched from a CDN).
- Screens are canvas textures redrawn only when their content changes; callouts stay DOM text, re-projected from 3D anchors each frame.
- Colours come from the CSS tokens (read at runtime), so materials and page never drift.
- The portfolio PDF is a CSS-3D hardcover book whose sheets turn with scroll (no WebGL needed there).
- Reduced motion or no WebGL: the static CSS device drawings are used instead.

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```
- JS: `useReducedMotion()` swaps every pinned chapter for a static layout (assembled devices side by side, roles and projects as plain lists).

## 8. Do's and Don'ts

### Do
- Let each chapter have exactly one device and one job (identity, skills, experience, projects).
- Show detailed content full-size beside the device, never only on its tiny screen.
- Keep one accent colour, used for interaction and callouts only.
- Alternate white and soft-grey chapters; never a black page background.
- Label every exploded part with a code, name and spec.
- Verify every chapter at 1440, 1100, 768 and 390px wide.

### Don't
- ❌ No hard-coded hex in components; use tokens.
- ❌ No rainbow / multi-hue gradients, no neon glows, no teal "AI" washes.
- ❌ No emoji as icons.
- ❌ No heavy (800+) headline weights.
- ❌ No `filter: blur()` on moving elements (floor shadow is static).
- ❌ No opacity on `preserve-3d` nodes (flattens exploded views); fade leaf elements instead.
- ❌ No scaling passing layers past 1.5× (hard-edged planes sweep across copy).
- ❌ No two headings visible at once during a scroll swap.
- ❌ No content under the fixed top bar.
- ❌ No eyebrow labels above headings, no "A · B · C" meta chains, no "→" appended to link text.
- ❌ No per-section fade-up entrances; motion belongs to the devices.
- ❌ No horizontal overflow at ≤ 600px.

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | ≥ 1024px | two columns, device right, callouts visible |
| Tablet | 768–1023px | device on top (scale .8), copy below, callouts hidden |
| Mobile | < 768px | device scale .6, copy below and trimmed to first paragraph, shelf swipeable, pinned tracks shortened 40% |

**Touch Targets:** minimum 44×44px (nav items get 44px hit area via padding)
**Collapsing Strategy:** nav pill stays (4 short labels fit at 390px); experience details collapse to one paragraph + chips; lineup filter tabs scroll horizontally.

```css
@media (max-width: 1023px) {
  .callout { display: none; }
  .device-stage { transform: scale(.8); }
}
@media (max-width: 767px) {
  .device-stage { transform: scale(.6); }
  .details p + p { display: none; }
  .filter-tabs { overflow-x: auto; scrollbar-width: none; }
}
```
