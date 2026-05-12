import Link from "next/link";
import { ArrowRight, ArrowUpRight, Gauge, Map, Monitor, Radio, Waves } from "lucide-react";

const telemetry = [
  { label: "Mode", value: "Portfolio Quest" },
  { label: "World", value: "Island Map" },
  { label: "Data", value: "Same project backend" },
  { label: "Status", value: "Playable" },
];

export default function GamePortalDashboard() {
  return (
    <section id="game-portal" className="relative overflow-hidden bg-[#05070b] px-6 py-24 text-white">
      <style>
        {`
          @keyframes portfolioBoatPass {
            0% { transform: translateX(-90px) translateY(0) rotate(-4deg); opacity: 0; }
            12% { opacity: 1; }
            50% { transform: translateX(235px) translateY(-20px) rotate(4deg); opacity: 1; }
            88% { opacity: 1; }
            100% { transform: translateX(520px) translateY(8px) rotate(-3deg); opacity: 0; }
          }
        `}
      </style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_44%,rgba(14,165,233,0.2),transparent_22%),radial-gradient(circle_at_32%_58%,rgba(20,184,166,0.18),transparent_26%),linear-gradient(135deg,#05070b,#0c141a_54%,#05070b)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-cyan-100/8 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-100/76">
            <Radio className="h-3.5 w-3.5" />
            Game dashboard
          </div>
          <h2 className="font-headline text-4xl font-extrabold leading-tight sm:text-6xl">
            Peek into the game version of the portfolio.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">
            The website explains the work directly. The game turns the same portfolio data into an explorable island
            map, with missions, project encounters, and a ship-based interface.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {telemetry.map((item) => (
              <div key={item.label} className="border-l border-cyan-100/18 bg-white/[0.04] p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/38">{item.label}</div>
                <div className="mt-1 text-sm font-bold text-white/80">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/game"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#05070b] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(125,252,255,0.22)]"
            >
              Launch the game
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-5 py-3 text-sm font-bold text-white/80 transition hover:bg-white/12"
            >
              <Map className="h-4 w-4" />
              Browse projects first
            </a>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-white/45 md:hidden">
            <Monitor className="h-3.5 w-3.5 shrink-0" />
            Best on desktop — on mobile this is a preview; play the full game on a computer.
          </p>
        </div>

        <Link href="/game" className="group relative block min-h-[560px]" aria-label="Open the game version">
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_120px_rgba(0,0,0,0.45)]" />
          <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(34,211,238,0.42),transparent_26%,rgba(20,184,166,0.32),transparent_58%,rgba(250,204,21,0.24),transparent)] opacity-80 blur-[1px] [animation:uiSpin_22s_linear_infinite]" />
          <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[inset_0_0_80px_rgba(0,0,0,1),0_0_80px_rgba(34,211,238,0.32)]" />
          <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-cyan-100/22 bg-black shadow-[0_0_80px_rgba(0,0,0,0.75)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(45,212,191,0.28),transparent_0_18%,rgba(8,47,73,0.56)_19%_28%,transparent_29%),radial-gradient(circle_at_32%_40%,rgba(132,204,22,0.95)_0_4%,transparent_5%),radial-gradient(circle_at_64%_34%,rgba(250,204,21,0.92)_0_3.5%,transparent_4.5%),radial-gradient(circle_at_56%_68%,rgba(34,211,238,0.92)_0_4%,transparent_5%),linear-gradient(180deg,#0b1720,#061015)]" />
            <div className="absolute left-[24%] top-[38%] h-16 w-24 rotate-[-10deg] rounded-[55%_45%_50%_50%] bg-lime-300/80 shadow-[0_0_28px_rgba(190,242,100,0.35)]" />
            <div className="absolute right-[20%] top-[30%] h-20 w-28 rotate-[14deg] rounded-[55%_45%_50%_50%] bg-amber-200/80 shadow-[0_0_28px_rgba(253,230,138,0.32)]" />
            <div className="absolute bottom-[22%] left-[38%] h-14 w-24 rotate-[8deg] rounded-[55%_45%_50%_50%] bg-cyan-200/75 shadow-[0_0_28px_rgba(165,243,252,0.35)]" />
            <div className="absolute left-[8%] top-[55%] h-8 w-16" style={{ animation: "portfolioBoatPass 5.5s ease-in-out infinite" }}>
              <div className="absolute bottom-0 h-4 w-16 rounded-b-full rounded-t-[8px] bg-white shadow-[0_0_18px_rgba(255,255,255,0.5)]" />
              <div className="absolute bottom-3 left-8 h-16 w-px bg-white/80" />
              <div className="absolute bottom-6 left-8 h-0 w-0 border-b-[30px] border-l-[22px] border-b-cyan-100 border-l-transparent" />
            </div>
            <div className="absolute left-1/2 top-1/2 h-12 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-white/12 backdrop-blur-sm" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_42%,rgba(0,0,0,0.92)_78%),linear-gradient(180deg,rgba(125,252,255,0.12),transparent_28%,rgba(0,0,0,0.45))]" />
          </div>

          <div className="absolute left-1/2 top-[13%] flex -translate-x-1/2 items-center gap-2 rounded-full border border-cyan-100/20 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-100 shadow-[0_0_30px_rgba(125,252,255,0.18)] backdrop-blur-md">
            Game entrance
            <ArrowRight className="h-4 w-4 animate-pulse" />
          </div>

          <div className="absolute left-6 top-8 rounded-2xl border border-white/12 bg-black/45 p-4 backdrop-blur-md">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-100/60">
              <Gauge className="h-4 w-4" />
              Signal
            </div>
            <div className="h-2 w-36 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[82%] rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(125,252,255,0.75)]" />
            </div>
          </div>

          <div className="absolute bottom-8 right-6 rounded-2xl border border-white/12 bg-black/45 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-100/12">
                <Waves className="h-5 w-5 text-cyan-100" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/42">Portal open</div>
                <div className="text-sm font-bold text-white/80">Game route: /game</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
