"use client";

import { motion } from "framer-motion";

const skills = [
  "Next.js", "React", "TypeScript", "Python",
  "SolidWorks", "CATIA V6", "Arduino", "Raspberry Pi",
  "FEA", "GD&T", "Lean Six Sigma", "ROS 2",
];

export default function About() {
  return (
    <section id="bio" className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-xs font-label tracking-widest uppercase text-[var(--color-primary)] mb-4">
              About
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-[var(--color-on-surface)] mb-6 leading-tight">
              Engineer who builds<br />
              <span className="text-[var(--color-primary)]">end-to-end.</span>
            </h2>
            <div className="space-y-4 text-[var(--color-on-surface-variant)] leading-relaxed">
              <p>
                I&apos;m Louis, a Mechanical Engineering student at Polytechnique Montréal. I bridge the gap between hardware and software — from designing lunar transport systems with CATIA to building full-stack apps with Next.js.
              </p>
              <p>
                I&apos;ve interned at Lockheed Martin and the City of Montreal, with an upcoming role at Tesla&apos;s Gigafactory. On the competition circuit, I&apos;ve won hackathon awards at ConUHacks and RoboHacks.
              </p>
              <p>
                My portfolio is also a game — sail through the islands to discover projects the other way.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-3 py-1 text-xs font-medium text-[var(--color-on-surface-variant)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Avatar / visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <div className="relative w-72 h-72 lg:w-96 lg:h-96">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--color-primary)]/20 animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-6 rounded-full border border-[var(--color-primary)]/10" />

              {/* Center orb */}
              <div
                className="absolute inset-8 rounded-full flex items-center justify-center text-8xl"
                style={{
                  background: `radial-gradient(circle, var(--color-surface-container) 0%, var(--color-surface-container-low) 100%)`,
                  border: `2px solid var(--color-outline-variant)`,
                  boxShadow: "0 0 40px rgba(0,101,111,0.15), inset 0 2px 20px rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>🧑‍💻</span>
              </div>

              {/* Floating skill badges */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-white shadow-lg">
                ⚙️ Engineering
              </div>
              <div className="absolute top-1/4 -right-2 rounded-full bg-[var(--color-surface-container-highest)] px-3 py-1 text-xs font-medium text-[var(--color-on-surface)] shadow border border-[var(--color-outline-variant)]">
                💻 Software
              </div>
              <div className="absolute bottom-1/4 -left-4 rounded-full bg-[var(--color-secondary-container)] px-3 py-1 text-xs font-medium text-[var(--color-on-secondary-container)] shadow">
                🚀 Space
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
