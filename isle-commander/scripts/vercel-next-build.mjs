import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

const appRoot = process.cwd();
const workspaceRoot = resolve(appRoot, "..");
const source = join(appRoot, ".next", "routes-manifest.json");
const targets = Array.from(
  new Set([
    join(appRoot, ".next", "routes-manifest-deterministic.json"),
    join(workspaceRoot, ".next", "routes-manifest-deterministic.json"),
  ])
);

const placeholder = `${JSON.stringify({
  version: 3,
  pages404: true,
  appType: "app",
  caseSensitive: false,
  basePath: "",
  redirects: [],
  headers: [],
  onMatchHeaders: [],
  rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
  dynamicRoutes: [],
  staticRoutes: [],
  dataRoutes: [],
})}\n`;

function syncManifest() {
  const contents = existsSync(source) ? readFileSync(source, "utf8") : placeholder;

  for (const target of targets) {
    mkdirSync(dirname(target), { recursive: true });
    if (!existsSync(target) || readFileSync(target, "utf8") !== contents) {
      writeFileSync(target, contents);
    }
  }
}

const nextBinCandidates = [
  join(appRoot, "node_modules", "next", "dist", "bin", "next"),
  join(workspaceRoot, "node_modules", "next", "dist", "bin", "next"),
];
const nextBin = nextBinCandidates.find(existsSync);

if (!nextBin) {
  throw new Error(`Could not find Next.js. Run npm install from ${workspaceRoot}.`);
}

syncManifest();
const interval = setInterval(syncManifest, 25);

const child = spawn(process.execPath, [nextBin, "build", "--webpack"], {
  cwd: appRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  clearInterval(interval);
  syncManifest();

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
