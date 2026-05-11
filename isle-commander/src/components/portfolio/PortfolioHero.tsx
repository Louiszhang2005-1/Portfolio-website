"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`} style={style}>
      {words.map((word, index) => {
        const isLast = index === words.length - 1;

        return (
          <motion.span
            key={word}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute -right-[0.28em] top-[0.66em] text-[0.28em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

const navItems = [
  { label: "Story", href: "#about" },
  { label: "Full PDF", href: "#portfolio-deck" },
  { label: "Projects", href: "#project-orbit" },
  { label: "Game", href: "#game-portal" },
  { label: "Experience", href: "#experience" },
  { label: "Inquiries", href: "#contact" },
];

export default function PortfolioHero() {
  return (
    <section id="about" className="h-screen w-full bg-[#050505] p-2 text-[#e1e0cc] sm:p-4">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/media/robohacks/robot-held.jpg"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(89,234,251,0.18),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.05)_38%,rgba(0,0,0,0.55))]" />
        <div
          className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.32] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="flex max-w-[calc(100vw-1rem)] items-center gap-5 overflow-x-auto rounded-b-2xl bg-black/80 backdrop-blur-md px-6 py-3 shadow-2xl [scrollbar-width:none] sm:gap-8 md:gap-12 md:rounded-b-3xl md:px-10 md:py-4 lg:gap-14">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="whitespace-nowrap text-xs font-medium text-[#e1e0cc]/75 transition-colors hover:text-[#e1e0cc] sm:text-sm md:text-base"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Name — positioned higher, stacked Louis / Zhang */}
        <div className="absolute left-4 bottom-[28%] sm:left-6 md:left-10 sm:bottom-[24%]">
          <h1 className="font-headline font-medium leading-[0.85] tracking-[-0.07em] text-[#e1e0cc]">
            <WordsPullUp
              text="Louis"
              className="block"
              style={{ fontSize: "clamp(4.5rem, 16vw, 13rem)" }}
            />
            <WordsPullUp
              text="Zhang"
              showAsterisk
              className="block"
              style={{ fontSize: "clamp(4.5rem, 16vw, 13rem)" }}
            />
          </h1>
        </div>

        {/* Description + CTA — bottom right */}
        <div className="absolute bottom-0 right-0 left-0 px-4 pb-4 sm:px-6 md:px-10 lg:left-auto lg:max-w-lg lg:pb-8">
          <div className="relative z-10 flex flex-col gap-5">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md text-xs leading-[1.5] text-[#e1e0cc]/80 sm:text-sm md:text-base"
            >
              I&apos;m Louis Zhang: mechanical engineering, software, robotics, and a playable portfolio world stitched
              from the same project data.
            </motion.p>

            <div className="flex flex-wrap gap-3">
              <motion.a
                href="#project-orbit"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="group inline-flex items-center gap-2 self-start rounded-full bg-[#e1e0cc] py-1 pl-5 pr-1 text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
              >
                See the builds
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 text-[#e1e0cc]" />
                </span>
              </motion.a>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href="/game"
                  className="group inline-flex items-center gap-2 rounded-full border border-[#e1e0cc]/20 bg-black/35 py-1 pl-5 pr-1 text-sm font-medium text-[#e1e0cc] backdrop-blur transition-all hover:gap-3 sm:text-base"
                >
                  Play mode
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e1e0cc]/12 transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <Gamepad2 className="h-4 w-4 text-[#e1e0cc]" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-6 hidden text-[10px] font-bold uppercase tracking-[0.35em] text-[#e1e0cc]/38 md:block">
          * playable engineering archive
        </div>
      </div>
    </section>
  );
}
