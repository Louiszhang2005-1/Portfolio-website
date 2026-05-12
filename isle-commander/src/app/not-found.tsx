import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "var(--color-background)", color: "var(--color-on-surface)" }}
    >
      <div
        className="text-7xl font-black tracking-tighter"
        style={{ color: "var(--color-primary)" }}
      >
        404
      </div>
      <h1 className="font-headline text-2xl font-extrabold sm:text-3xl">
        Off the map — this page doesn&apos;t exist.
      </h1>
      <p className="max-w-sm text-sm leading-7" style={{ color: "var(--color-on-surface-variant)" }}>
        The coordinates you entered don&apos;t match any island in the fleet. Head back to shore.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: "var(--color-primary)" }}
        >
          Home
        </Link>
        <Link
          href="/#projects"
          className="rounded-full border px-6 py-3 text-sm font-bold transition"
          style={{
            borderColor: "var(--color-outline-variant)",
            background: "var(--color-surface-container-low)",
            color: "var(--color-on-surface)",
          }}
        >
          Projects
        </Link>
      </div>
    </div>
  );
}
