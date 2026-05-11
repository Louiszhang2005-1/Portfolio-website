"use client";

import { motion } from "framer-motion";
import { GitBranch, Mail, Anchor } from "lucide-react";
import Link from "next/link";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-xs font-label tracking-widest uppercase text-[var(--color-primary)] mb-4">
            Contact
          </div>
          <h2 className="font-headline text-4xl font-extrabold text-[var(--color-on-surface)] mb-4">
            Let&apos;s connect
          </h2>
          <p className="text-[var(--color-on-surface-variant)] mb-10 max-w-md mx-auto leading-relaxed">
            Whether you&apos;re looking for an engineering intern, want to collaborate on a project, or just want to say hi — reach out.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:zlouis2005@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Mail className="h-4 w-4" />
              zlouis2005@gmail.com
            </a>

            <a
              href="https://github.com/Louiszhang2005-1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-3 text-sm font-semibold text-[var(--color-on-surface)] transition-all hover:bg-[var(--color-surface-container)] hover:shadow"
            >
              <GitBranch className="h-4 w-4" />
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/louis-zhang-ba2a17284/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-3 text-sm font-semibold text-[var(--color-on-surface)] transition-all hover:bg-[var(--color-surface-container)] hover:shadow"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>

            <Link
              href="/game"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/20"
            >
              <Anchor className="h-4 w-4" />
              Play the Game Version
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
