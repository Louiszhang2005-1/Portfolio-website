"use client";

import { useMotionValue } from "framer-motion";
import { Phone, Watch, type Motion } from "./devices";
import { CONTACT, OpenTo, btnGhostDark, btnPrimaryDark } from "./stage";

const SKILLS: [string, string[]][] = [
  ["Software", ["Python", "TypeScript", "React", "Next.js", "LLM agents", "SQL"]],
  ["Mechanical design", ["SolidWorks", "CATIA V6", "GD&T", "DFM / DFA", "FEA (Ansys)"]],
  ["Electronics", ["Arduino", "ESP32", "Raspberry Pi", "ROS 2", "PLC / HMI"]],
  ["Manufacturing", ["CNC machining", "Root-cause analysis", "Equipment design"]],
];

/** Reduced motion: the watch and phone chapters as still, assembled devices. */
export function StaticIntro({ id }: { id: string }) {
  const zero = useMotionValue(0);
  const one = useMotionValue(1);
  const m: Motion = { spread: zero, fade: one, tilt: zero, dive: zero };
  return (
    <section id={id} data-theme="light" className="white px-6 md:px-10 xl:px-16 pb-24 pt-32">
      <div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-[clamp(3.25rem,7.5vw,6.5rem)]">Louis Zhang</h1>
          <p className="mt-5 max-w-[34rem] text-lg text-[var(--text-secondary)]">
            Mechanical engineering student at Polytechnique Montréal. I design hardware and write the software that runs
            on it.
          </p>
          <p className="mt-4 max-w-[34rem] text-sm text-[var(--text-tertiary)]">
            Interned at Tesla, Lockheed Martin and the City of Montréal. Hackathon winner at HackHarvard 2026, ConUHacks X
            and RoboHacks 2025.
          </p>
          <OpenTo className="mt-4" />
          <div className="mt-7 flex flex-wrap gap-3">
            <a className={btnPrimaryDark} href="#chapter-deck">
              See the portfolio
            </a>
            <a className={btnGhostDark} href={`mailto:${CONTACT.email}`}>
              Email me
            </a>
          </div>
        </div>
        <div className="flex justify-center">
          <Watch m={m} notif={zero} />
        </div>
      </div>
    </section>
  );
}

export function StaticSkills({ id }: { id: string }) {
  const zero = useMotionValue(0);
  const one = useMotionValue(1);
  const m: Motion = { spread: zero, fade: one, tilt: zero, dive: zero };
  return (
    <section id={id} data-theme="light" className="white px-6 md:px-10 xl:px-16 py-28">
      <div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)]">What I work with.</h2>
          <dl className="mt-8 space-y-6">
            {SKILLS.map(([area, tools]) => (
              <div key={area}>
                <dt className="text-lg font-medium">{area}</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {tools.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex justify-center">
          <Phone m={m} lockOn={zero} homeOn={one} codeOn={zero} screwsOut={zero} progress={one} />
        </div>
      </div>
    </section>
  );
}
