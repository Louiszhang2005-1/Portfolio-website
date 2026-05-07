"use client";

import { motion, useInView } from "framer-motion";
import { Anchor, ArrowRight, Briefcase, Compass, Gamepad2, GitBranch, Mail, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import SprocketAvatar from "../SprocketAvatar";
import { VoyageBackdrop } from "./landing-backdrop";
import styles from "./landing-hero.module.css";

interface WordsPullUpProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const WordsPullUp = ({ text, className = "", style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={{ marginRight: i < words.length - 1 ? "0.3em" : 0 }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const navItems = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Projects", href: "/portfolio#projects" },
  { label: "Experience", href: "/portfolio#experience" },
  { label: "Contact", href: "/portfolio#contact" },
];

const credibilitySignals = [
  {
    label: "Tesla",
    detail: "Incoming Cell Engineering",
    logo: "/logo/tesla.jpg",
    tone: "text-[#ffb7a6]",
    accent: "#ef4444",
  },
  {
    label: "Lockheed Martin",
    detail: "Ship Integrations",
    logo: "/logo/lockheed-martin.jpg",
    tone: "text-[#a8c7ff]",
    accent: "#60a5fa",
  },
  {
    label: "City of Montreal",
    detail: "Water Testing",
    logo: "/logo/city-of-montreal.gif",
    tone: "text-[#89f5ff]",
    accent: "#22d3ee",
  },
];

const featuredSignals = [
  { title: "CSA Lunar LEAP", detail: "PM & Systems Integrator", accent: "#f2d98a" },
  { title: "Autonomous Reforestation Robot", detail: "RoboHacks Award", accent: "#7ec850" },
  { title: "ResQ-Link", detail: "Passive NFC disaster-response hardware", accent: "#ff6b8a" },
  { title: "CRM Outreach Tool", detail: "AI + Google Sheets automation", accent: "#59eafb" },
];

const islands = [
  { x: 0.18, y: 0.3, w: 0.12, h: 0.07, color: "#7ec850", label: "Robotics" },
  { x: 0.75, y: 0.25, w: 0.14, h: 0.08, color: "#f2d98a", label: "Aerospace" },
  { x: 0.5, y: 0.7, w: 0.11, h: 0.065, color: "#ff9734", label: "Software" },
  { x: 0.25, y: 0.72, w: 0.09, h: 0.055, color: "#a855f7", label: "Physics" },
  { x: 0.82, y: 0.65, w: 0.1, h: 0.06, color: "#59eafb", label: "IoT" },
];

function MiniGameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boatRef = useRef({ x: 0.5, y: 0.55, vx: 0, vy: 0 });
  const wakeRef = useRef<Array<{ x: number; y: number; age: number; maxAge: number }>>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const waves = Array.from({ length: 5 }, (_, i) => ({
      offset: Math.random() * Math.PI * 2,
      amplitude: 2 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.4,
      y: 0.15 + i * 0.18,
    }));

    let animId = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      const W = canvas.clientWidth || 1;
      const H = canvas.clientHeight || 1;
      const t = frameRef.current++ * 0.016;
      const boat = boatRef.current;

      ctx.clearRect(0, 0, W, H);

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#08202f");
      grad.addColorStop(0.42, "#176375");
      grad.addColorStop(1, "#092331");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(137, 245, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      for (const wave of waves) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(232, 255, 248, 0.13)";
        ctx.lineWidth = 1.5;
        for (let x = 0; x < W; x += 3) {
          const nx = x / W;
          const wy = wave.y * H + Math.sin(nx * 8 + t * wave.speed + wave.offset) * wave.amplitude;
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }

      for (const isl of islands) {
        const ix = isl.x * W;
        const iy = isl.y * H + Math.sin(t * 0.5 + isl.x * 10) * 2;
        const iw = isl.w * W;
        const ih = isl.h * H;

        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        ctx.ellipse(ix, iy + ih * 0.62, iw * 0.55, ih * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isl.color;
        ctx.beginPath();
        ctx.ellipse(ix, iy, iw * 0.5, ih * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = isl.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = `${isl.color}44`;
        ctx.beginPath();
        ctx.ellipse(ix, iy, iw * 0.35, ih * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
        ctx.font = "bold 9px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(isl.label, ix, iy + ih * 0.5 + 14);
      }

      const routeAngle = t * 0.42;
      const targetX = 0.5 + Math.cos(routeAngle) * 0.34;
      const targetY = 0.5 + Math.sin(routeAngle * 1.12) * 0.23;
      const nextTargetX = 0.5 + Math.cos(routeAngle + 0.1) * 0.34;
      const nextTargetY = 0.5 + Math.sin((routeAngle + 0.1) * 1.12) * 0.23;

      ctx.beginPath();
      ctx.ellipse(0.5 * W, 0.5 * H, 0.34 * W, 0.23 * H, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(137, 245, 255, 0.16)";
      ctx.lineWidth = 1;
      ctx.setLineDash([7, 10]);
      ctx.stroke();
      ctx.setLineDash([]);

      boat.vx += (targetX - boat.x) * 0.012;
      boat.vy += (targetY - boat.y) * 0.012;

      boat.vx *= 0.96;
      boat.vy *= 0.96;
      boat.x = Math.max(0.05, Math.min(0.95, boat.x + boat.vx));
      boat.y = Math.max(0.05, Math.min(0.95, boat.y + boat.vy));

      const speed = Math.hypot(boat.vx, boat.vy);
      if (speed > 0.002 && frameRef.current % 3 === 0) {
        wakeRef.current.push({ x: boat.x, y: boat.y, age: 0, maxAge: 40 });
      }
      if (wakeRef.current.length > 30) wakeRef.current.splice(0, wakeRef.current.length - 30);

      for (let i = wakeRef.current.length - 1; i >= 0; i--) {
        const p = wakeRef.current[i];
        p.age++;
        if (p.age > p.maxAge) {
          wakeRef.current.splice(i, 1);
          continue;
        }
        const progress = p.age / p.maxAge;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 3 + progress * 12, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(137, 245, 255, ${0.32 * (1 - progress)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const bx = boat.x * W;
      const by = boat.y * H;
      const heading = Math.atan2(nextTargetY - boat.y, nextTargetX - boat.x);

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(heading);
      ctx.shadowColor = "#89f5ff";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#fff8e9";
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-8, -7);
      ctx.quadraticCurveTo(-12, 0, -8, 7);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
      ctx.fillRect(-2, -12, 1.5, 10);
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath();
      ctx.moveTo(-0.5, -12);
      ctx.lineTo(6, -10);
      ctx.lineTo(-0.5, -8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const cx = W - 28;
      const cy = 28;
      ctx.strokeStyle = "rgba(137, 245, 255, 0.48)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(232, 255, 248, 0.68)";
      ctx.font = "bold 7px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", cx, cy - 7);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(heading);
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(-3, 4);
      ctx.lineTo(3, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    resizeCanvas();
    render();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
    />
  );
}

const panelBase = `${styles.heroPanel} landing-panel group relative flex min-h-[280px] flex-col overflow-hidden border backdrop-blur-xl transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#89f5ff]`;

export const LandingHero = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hoveredPanel, setHoveredPanel] = useState<"portfolio" | "game" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGlobalMouse = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#05070d] text-white" id="landing-hero">
      <div
        ref={containerRef}
        className="relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden px-4 pb-8 pt-16 sm:px-6 sm:pb-10 sm:pt-20"
        onMouseMove={handleGlobalMouse}
      >
        <VoyageBackdrop activePanel={hoveredPanel} mousePos={mousePos} />

        <nav className="absolute left-1/2 top-3 z-30 w-[min(calc(100%-1rem),560px)] -translate-x-1/2">
          <div className="flex items-center justify-between gap-1 overflow-x-auto rounded-[8px] border border-white/10 bg-black/55 px-2 py-2 shadow-2xl backdrop-blur-xl [scrollbar-width:none] sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap rounded-md px-3 py-2 text-[11px] font-medium text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute right-4 top-3 z-30 hidden items-center gap-2 xl:flex">
          <a
            href="mailto:zlouis2005@gmail.com"
            className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#89f5ff]/20 bg-black/45 px-4 text-xs font-semibold text-[#dffbff]/82 shadow-xl backdrop-blur-xl transition-colors hover:border-[#89f5ff]/44 hover:bg-[#89f5ff]/10 hover:text-white"
            aria-label="Email Louis Zhang"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
          <a
            href="https://github.com/Louiszhang2005-1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#f7e7bd]/18 bg-black/45 px-4 text-xs font-semibold text-[#f7e7bd]/78 shadow-xl backdrop-blur-xl transition-colors hover:border-[#f7e7bd]/40 hover:bg-[#f7e7bd]/10 hover:text-white"
            aria-label="Open Louis Zhang GitHub"
          >
            <GitBranch className="h-4 w-4" />
            GitHub
          </a>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-2.5 py-7 sm:gap-3.5 lg:py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 text-[10px] font-label uppercase tracking-[0.28em] text-[#89f5ff]/80 sm:text-xs"
          >
            <span className="h-px w-8 bg-[#89f5ff]/30" />
            Mechanical &amp; Software Engineer
            <span className="h-px w-8 bg-[#89f5ff]/30" />
          </motion.div>

          <h1 className="text-center font-headline text-4xl font-extrabold leading-none tracking-normal text-white sm:text-6xl lg:text-7xl">
            <WordsPullUp text="Louis Zhang" />
          </h1>

          <div className="flex max-w-3xl flex-col items-center gap-2 text-center">
            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm font-semibold leading-5 text-[#f7f1df]/84 sm:text-lg sm:leading-6"
            >
              Mechanical engineering student at Polytechnique Montréal building across hardware, manufacturing,
              aerospace, robotics, and software.
            </motion.p>
            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl text-xs leading-5 text-[#f7f1df]/58 sm:text-sm sm:leading-6"
            >
              From municipal water testing to ship integration, battery manufacturing, lunar transport systems, and
              rapid robotics/software builds.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.46 }}
            className="w-full max-w-4xl"
          >
            <div className="mb-2 flex items-center justify-center gap-2 text-[9px] font-label font-black uppercase tracking-[0.24em] text-white/42">
              <span className="h-px w-8 bg-white/14" />
              Experience Route
              <span className="h-px w-8 bg-white/14" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {credibilitySignals.map((signal) => (
                <div
                  key={signal.label}
                  className="group relative grid items-center justify-items-center gap-1.5 overflow-hidden rounded-[8px] border border-white/12 bg-black/42 px-1.5 py-2 text-center shadow-[0_18px_46px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-colors hover:border-white/24 sm:grid-cols-[70px_1fr] sm:justify-items-start sm:gap-3 sm:px-4 sm:py-4 sm:text-left"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-px opacity-70"
                    style={{ background: `linear-gradient(90deg, transparent, ${signal.accent}, transparent)` }}
                  />
                  <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-[8px] border border-white/12 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:h-16 sm:w-16">
                    <Image
                      src={signal.logo}
                      alt={`${signal.label} logo`}
                      fill
                      sizes="(min-width: 640px) 64px, 40px"
                      className="scale-110 object-contain p-1"
                    />
                  </div>
                  <div className="relative min-w-0">
                    <div
                      className={`font-label text-[7px] font-black uppercase tracking-[0.08em] sm:text-[10px] sm:tracking-[0.18em] ${signal.tone}`}
                    >
                      {signal.label}
                    </div>
                    <div className="mt-0.5 text-[9px] font-semibold leading-tight text-white/72 sm:mt-1 sm:text-sm">
                      {signal.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
            className="w-full max-w-5xl"
          >
            <div className="mb-2 flex items-center justify-center gap-2 text-[9px] font-label font-black uppercase tracking-[0.24em] text-white/42">
              <Sparkles className="h-3 w-3 text-[#f7e7bd]/62" />
              Featured Signals
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-4">
              {featuredSignals.map((signal) => (
                <div
                  key={signal.title}
                  className="rounded-[8px] border border-white/12 bg-white/[0.07] px-2.5 py-2 shadow-lg backdrop-blur-md sm:px-3 sm:py-2.5"
                  style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 38px ${signal.accent}18` }}
                >
                  <div className="mb-1 h-1 w-8 rounded-full" style={{ backgroundColor: signal.accent }} />
                  <div className="text-xs font-bold leading-tight text-white sm:text-sm">{signal.title}</div>
                  <div className="mt-0.5 text-[10px] leading-tight text-white/52 sm:mt-1 sm:text-[11px] sm:leading-snug">{signal.detail}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.58 }}
            className="grid w-full max-w-3xl grid-cols-[auto_1fr] items-center gap-2 rounded-[8px] border border-[#89f5ff]/18 bg-black/32 px-3 py-2 shadow-xl backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-2.5"
          >
            <div className="grid h-9 w-9 place-items-center overflow-visible sm:h-12 sm:w-12">
              <SprocketAvatar size={42} idle />
            </div>
            <div className="min-w-0 text-xs leading-4 text-[#dffbff]/72 sm:text-sm sm:leading-5">
              <span className="font-semibold text-white">Want the fast version?</span> Open the portfolio.
              <span className="hidden sm:inline"> </span>
              <span className="block sm:inline">
                <span className="font-semibold text-white">Want the memorable version?</span> Play the map.
              </span>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2 xl:hidden">
            <a
              href="mailto:zlouis2005@gmail.com"
              className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#89f5ff]/20 bg-black/38 px-3 text-xs font-semibold text-[#dffbff]/82 backdrop-blur-xl"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
            <a
              href="https://github.com/Louiszhang2005-1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#f7e7bd]/18 bg-black/38 px-3 text-xs font-semibold text-[#f7e7bd]/78 backdrop-blur-xl"
            >
              <GitBranch className="h-4 w-4" />
              GitHub
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62 }}
            className="flex items-center gap-3 text-[10px] font-label uppercase tracking-[0.28em] text-white/42"
          >
            <span className="h-px w-10 bg-white/16" />
            Launch Bay
            <span className="h-px w-10 bg-white/16" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
            className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] lg:gap-5"
          >
            <Link
              href="/portfolio"
              className={`${panelBase} landing-panel--portfolio border-[rgba(247,231,189,0.18)] bg-[#111015]/72 text-[#f7f1df] hover:border-[rgba(247,231,189,0.34)]`}
              onMouseEnter={() => setHoveredPanel("portfolio")}
              onMouseLeave={() => setHoveredPanel(null)}
            >
                <div className="relative z-10 m-3 mb-0 flex h-24 flex-col overflow-hidden rounded-md border border-white/10 bg-[#fff6dd] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] sm:h-40 lg:h-44">
                <div className="flex h-7 items-center gap-1.5 border-b border-white/10 bg-[#080a0f]/90 px-3">
                  <span className="h-2 w-2 rounded-full bg-[#ff6b6b]/75" />
                  <span className="h-2 w-2 rounded-full bg-[#ffd166]/75" />
                  <span className="h-2 w-2 rounded-full bg-[#5ee08d]/75" />
                  <div className="ml-2 flex h-4 flex-1 items-center rounded-sm bg-white/[0.08] px-2">
                    <span className="font-mono text-[8px] text-white/38">louiszhang.dev/portfolio</span>
                  </div>
                </div>

                <div className="relative flex-1 overflow-hidden">
                  <Image
                    src="/preview-portfolio.png"
                    alt="Portfolio preview"
                    fill
                    priority
                    sizes="(min-width: 1024px) 520px, 100vw"
                    className="object-cover object-top transition-transform duration-[5000ms] ease-out group-hover:-translate-y-6 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#89f5ff]/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </div>

              <div className="relative z-10 mt-auto p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-[#f7e7bd]/14">
                      <Briefcase className="h-4 w-4 text-[#f7e7bd]" />
                    </div>
                    <div>
                      <span className="block font-label text-[10px] uppercase tracking-[0.24em] text-[#f7e7bd]/66">
                        Website
                      </span>
                      <span className="text-[10px] font-semibold text-[#f7e7bd]/45">Best for recruiters</span>
                    </div>
                  </div>
                  <span className="font-label text-[10px] uppercase tracking-[0.24em] text-[#f7e7bd]/36">01</span>
                </div>

                <h2 className="font-headline text-xl font-bold leading-tight text-white sm:text-2xl">View Portfolio</h2>
                <p className="mt-2 max-w-sm text-sm leading-5 text-white/48">
                  Fast recruiter scan: internships, case studies, metrics, contact.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#f7e7bd]/78 transition-colors group-hover:text-[#f7e7bd]">
                  Explore
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <div className="hidden items-center justify-center lg:flex">
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-[#89f5ff]/45 to-transparent" />
                <div className="relative grid h-8 w-8 place-items-center rounded-[8px] border border-[#89f5ff]/25 bg-black/55 backdrop-blur">
                  <Compass className="h-4 w-4 text-[#89f5ff]/70" style={{ animation: "gearSpin 12s linear infinite" }} />
                </div>
              </div>
            </div>

            <Link
              href="/game"
              className={`${panelBase} landing-panel--game border-[rgba(137,245,255,0.22)] bg-[#061824]/72 text-[#dffbff] hover:border-[rgba(137,245,255,0.42)]`}
              onMouseEnter={() => setHoveredPanel("game")}
              onMouseLeave={() => setHoveredPanel(null)}
            >
              <div className="relative z-10 m-3 mb-0 h-24 overflow-hidden rounded-md border border-[#89f5ff]/18 bg-[#0b2a36] shadow-[inset_0_1px_0_rgba(255,255,255,0.13)] sm:h-40 lg:h-44">
                <MiniGameCanvas />

                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-md border border-[#89f5ff]/24 bg-black/52 px-3 py-1.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5ee08d]" />
                  <span className="font-label text-[9px] uppercase tracking-[0.18em] text-[#89f5ff]/78">Live Preview</span>
                </div>

                <div className="pointer-events-none absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md border border-white/12 bg-black/42 backdrop-blur-sm">
                  <Compass className="h-4 w-4 text-[#89f5ff]/70" />
                </div>
              </div>

              <div className="relative z-10 mt-auto p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-[#89f5ff]/14">
                      <Gamepad2 className="h-4 w-4 text-[#89f5ff]" />
                    </div>
                    <div>
                      <span className="block font-label text-[10px] uppercase tracking-[0.24em] text-[#89f5ff]/68">
                        Game Mode
                      </span>
                      <span className="text-[10px] font-semibold text-[#89f5ff]/45">Best for exploring</span>
                    </div>
                  </div>
                  <span className="font-label text-[10px] uppercase tracking-[0.24em] text-[#89f5ff]/38">02</span>
                </div>

                <h2 className="font-headline text-xl font-bold leading-tight text-white sm:text-2xl">
                  Play Isle Commander
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-5 text-white/48">
                  Interactive deep dive: sail through the same projects as an explorable map.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#89f5ff]/78 transition-colors group-hover:text-[#89f5ff]">
                  Set sail
                  <Anchor className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
