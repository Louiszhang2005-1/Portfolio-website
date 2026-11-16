/**
 * Shared mutable state between the DOM shell and the render loop. The loop reads and writes
 * plain objects every frame; React only hears about the rare changes (nearby stop, visits)
 * through subscribe(), so driving never re-renders a component.
 */

export const input = {
  /** keyboard: -1..1, +1 = forward */
  throttle: 0,
  /** keyboard: -1..1, +1 = left */
  steer: 0,
  boost: false,
  handbrake: false,
  /** touch / drag stick, in screen space: x right, y up, length 0..1 */
  stickActive: false,
  stickX: 0,
  stickY: 0,
  /** set by the shell (R key), consumed by the car */
  reset: false,
};

export const car = {
  x: 0,
  z: 0,
  heading: 0,
  vx: 0,
  vz: 0,
  /** signed speed along the heading */
  speed: 0,
  /** true once the visitor has moved, to fade the hints */
  moved: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

let nearbyId: string | null = null;
let visited: ReadonlySet<string> = new Set();
let moved = false;

export const driveStore = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  getNearby: () => nearbyId,
  getVisited: () => visited,
  getMoved: () => moved,
  setNearby(id: string | null) {
    if (id === nearbyId) return;
    nearbyId = id;
    if (id && !visited.has(id)) visited = new Set([...visited, id]);
    emit();
  },
  markMoved() {
    if (moved) return;
    moved = true;
    emit();
  },
};

/** the camera never rotates, so screen directions map to fixed world directions */
export const CAMERA_OFFSET = { x: 14, y: 21, z: 19 } as const;
const fl = Math.hypot(CAMERA_OFFSET.x, CAMERA_OFFSET.z);
/** world direction of "screen up" and "screen right" on the ground plane */
export const SCREEN_UP = { x: -CAMERA_OFFSET.x / fl, z: -CAMERA_OFFSET.z / fl } as const;
export const SCREEN_RIGHT = { x: -SCREEN_UP.z, z: SCREEN_UP.x } as const;
/** yaw that makes a plane face the camera */
export const CAMERA_YAW = Math.atan2(CAMERA_OFFSET.x, CAMERA_OFFSET.z);

export const SPAWN = { x: 0, z: 6, heading: 0 } as const;
export const WORLD_RADIUS = 66;

// dev-only handle for the browser tests
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __drive?: unknown }).__drive = { car, input };
}
