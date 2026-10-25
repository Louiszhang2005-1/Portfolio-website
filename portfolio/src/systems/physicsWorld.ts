import Matter from "matter-js";
import { missions, SPAWN_POSITION, WORLD_BOUNDS, barrels } from "@/data/missions";
import { SHIP_MASS, SHIP_FRICTION_AIR } from "@/systems/shipControls";

/* Builds the Matter.js world for /game: the ship, world walls, island and
   barrel bumpers, plus a collision callback for ship impacts. */

export const ISLAND_BUMPER_RADIUS = 76;
const BARREL_BUMPER_RADIUS = 28;

export type ImpactKind = "wall" | "island" | "barrel";

export interface ShipImpact {
  kind: ImpactKind;
  speed: number;
  normal: Matter.Vector;
}

export function createPhysicsWorld(onImpact: (impact: ShipImpact) => void) {
  // No built-in gravity — the game applies its own island gravity.
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });

  const ship = Matter.Bodies.polygon(SPAWN_POSITION.x, SPAWN_POSITION.y, 6, 22, {
    mass: SHIP_MASS,
    frictionAir: SHIP_FRICTION_AIR,
    restitution: 0.3,
    label: "ship",
    inertia: Infinity, // rotation is controlled directly, not by collisions
    inverseInertia: 0,
  });
  Matter.Body.setMass(ship, SHIP_MASS);

  const wallThickness = 100;
  const wallOpts = { isStatic: true, label: "wall", restitution: 0.5 };
  const walls = [
    Matter.Bodies.rectangle(0, -WORLD_BOUNDS - wallThickness / 2, WORLD_BOUNDS * 3, wallThickness, wallOpts),
    Matter.Bodies.rectangle(0, WORLD_BOUNDS + wallThickness / 2, WORLD_BOUNDS * 3, wallThickness, wallOpts),
    Matter.Bodies.rectangle(-WORLD_BOUNDS - wallThickness / 2, 0, wallThickness, WORLD_BOUNDS * 3, wallOpts),
    Matter.Bodies.rectangle(WORLD_BOUNDS + wallThickness / 2, 0, wallThickness, WORLD_BOUNDS * 3, wallOpts),
  ];

  const islandBumpers = missions
    .filter((mission) => mission.status !== "locked")
    .map((mission) =>
      Matter.Bodies.circle(mission.position.x, mission.position.y, ISLAND_BUMPER_RADIUS, {
        isStatic: true,
        label: `island:${mission.id}`,
        restitution: 0.62,
        friction: 0.05,
        frictionStatic: 0.05,
      }),
    );

  const barrelBumpers = barrels.map((barrel) =>
    Matter.Bodies.circle(barrel.position.x, barrel.position.y, BARREL_BUMPER_RADIUS, {
      isStatic: true,
      label: `barrel:${barrel.id}`,
      restitution: 0.82,
      friction: 0.02,
      frictionStatic: 0.02,
    }),
  );

  Matter.Composite.add(engine.world, [ship, ...walls, ...islandBumpers, ...barrelBumpers]);

  Matter.Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      if (pair.bodyA !== ship && pair.bodyB !== ship) continue;
      const other = pair.bodyA === ship ? pair.bodyB : pair.bodyA;
      const kind: ImpactKind | null =
        other.label === "wall" ? "wall"
          : other.label.startsWith("island:") ? "island"
            : other.label.startsWith("barrel:") ? "barrel"
              : null;
      if (!kind) continue;

      const speed = Math.hypot(ship.velocity.x, ship.velocity.y);
      const normal = pair.collision.normal;
      if (kind === "barrel" || (kind === "island" && speed > 1.15)) {
        const k = kind === "barrel" ? 0.032 : 0.018;
        Matter.Body.applyForce(ship, ship.position, { x: normal.x * k, y: normal.y * k });
      }
      onImpact({ kind, speed, normal });
    }
  });

  return { engine, ship };
}
