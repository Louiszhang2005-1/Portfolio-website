"use client";

import { useEffect, useRef } from "react";

const MOVE_KEYS = ["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"];

interface GameKeyboardOptions {
  /** Currently held helm keys (read by the physics loop) */
  keysRef: React.RefObject<Set<string>>;
  /** True while a blueprint or the map is open — helm keys are ignored then */
  isPanelOpen: () => boolean;
  onHelmInput: () => void;
  onEnter: () => void;
  onEscape: () => void;
  onToggleMap: () => void;
}

/**
 * /game keyboard: WASD/arrows (held helm keys), ENTER (inspect / dock),
 * ESC (close panels) and M (map). Ignores typing in form fields and leaves
 * ENTER to focused buttons/links. Clears held keys on blur so the ship never
 * keeps thrusting after the tab loses focus.
 */
export function useGameKeyboard(options: GameKeyboardOptions) {
  const optsRef = useRef(options);
  useEffect(() => { optsRef.current = options; });

  useEffect(() => {
    const keys = () => optsRef.current.keysRef.current;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      const o = optsRef.current;
      const key = e.key.toLowerCase();

      if (MOVE_KEYS.includes(key)) {
        if (o.isPanelOpen()) return; // let modals scroll with arrows
        e.preventDefault();
        keys().add(key);
        o.onHelmInput();
      } else if (key === "enter") {
        if ((target && target.closest("button, a")) || o.isPanelOpen()) return;
        e.preventDefault();
        o.onEnter();
      } else if (key === "escape") {
        o.onEscape();
      } else if (key === "m") {
        e.preventDefault();
        keys().clear();
        o.onToggleMap();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys().delete(e.key.toLowerCase()); };
    const clearKeys = () => keys().clear();
    const handleVisibility = () => { if (document.hidden) clearKeys(); };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
