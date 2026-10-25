/** Materials read their colours from the same CSS tokens as the page (DESIGN.md §2), so 3D and DOM never drift. */
const TOKEN_NAMES = [
  "--accent",
  "--accent-rgb",
  "--accent-ink",
  "--text",
  "--text-secondary",
  "--text-tertiary",
  "--surface",
  "--surface-alt",
  "--surface-hover",
  "--surface-light",
  "--border",
  "--mat-alu-hi",
  "--mat-alu-mid",
  "--mat-alu-lo",
  "--mat-steel",
  "--mat-graphite",
  "--mat-graphite-hi",
  "--mat-chip",
  "--mat-chip-edge",
  "--mat-pcb",
  "--mat-trace",
  "--mat-gold",
  "--mat-cap",
  "--mat-kapton",
  "--mat-led",
  "--mat-flash",
  "--mat-black",
  "--mat-ink",
] as const;
export type Tokens = Record<(typeof TOKEN_NAMES)[number], string>;

let cached: Tokens | null = null;
export function readTokens(): Tokens {
  if (cached) return cached;
  // screens are dark like real displays: read the .on-dark scope, not the light page tokens
  const root = document.querySelector("[data-token-source]") ?? document.querySelector(".proto") ?? document.documentElement;
  const cs = getComputedStyle(root);
  cached = Object.fromEntries(TOKEN_NAMES.map((n) => [n, cs.getPropertyValue(n).trim() || "#888"])) as Tokens;
  return cached;
}
