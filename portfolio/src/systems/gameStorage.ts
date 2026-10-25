/* localStorage helpers for /game progress. All access is guarded: storage can
   be unavailable (private mode, blocked site data) and the game must still run. */

const STORAGE_KEY_VISITED = "isle-commander-visited";
const STORAGE_KEY_COLLECTED = "isle-commander-collected";
const STORAGE_KEY_BRIEFING = "isle-commander-briefing-seen";

function loadSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(key);
    if (stored) return new Set(JSON.parse(stored));
  } catch { /* ignore */ }
  return new Set();
}

function saveSet(key: string, ids: Set<string>) {
  try { localStorage.setItem(key, JSON.stringify([...ids])); } catch { /* ignore */ }
}

export const loadVisited = () => loadSet(STORAGE_KEY_VISITED);
export const saveVisited = (ids: Set<string>) => saveSet(STORAGE_KEY_VISITED, ids);
export const loadCollected = () => loadSet(STORAGE_KEY_COLLECTED);
export const saveCollected = (ids: Set<string>) => saveSet(STORAGE_KEY_COLLECTED, ids);

export function hasSeenBriefing(): boolean {
  try { return localStorage.getItem(STORAGE_KEY_BRIEFING) === "1"; } catch { return false; }
}

export function markBriefingSeen() {
  try { localStorage.setItem(STORAGE_KEY_BRIEFING, "1"); } catch { /* ignore */ }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
