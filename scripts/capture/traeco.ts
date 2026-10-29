/*
  Records the Traeco case-study clips from the live dashboard (2026-10-29).

    npm run capture:traeco            all shots + the two stills
    npm run capture:traeco -- hero    one shot by id

  Everything that is timing or choreography lives in traeco.config.json:
  cursor speed and pauses, each shot's steps, its poster frame, the encode
  ladder. Edit the JSON and rerun. The dashboard and its mock API must be
  up (see .claude/launch.json: traeco-mock-api, traeco-dashboard), and the
  login comes from the env variables named in the config - never from this
  file or the repo.

  Playwright draws no pointer, so a small cursor element is injected and
  moved with eased steps alongside page.mouse, with a ripple on click.
  Scrollbars, dev overlays and the demo switch are hidden before recording.
  Output: H.264 mp4 (no audio, under the configured size) and a jpg poster
  taken at the configured moment rather than the first frame.
*/
import { chromium, type Page, type BrowserContext } from "playwright";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import ffmpegPath from "ffmpeg-static";

const ffmpeg = String(ffmpegPath);
const ROOT = process.cwd();
// the package is CommonJS, so the script runs as CJS under tsx: no top-level await here
const config = JSON.parse(require("node:fs").readFileSync(path.join(ROOT, "scripts/capture/traeco.config.json"), "utf8")) as Config;

type Step =
  | { type: "wait"; ms: number }
  | { type: "waitFor"; target: string; ms?: number }
  | { type: "move"; target: string }
  | { type: "click" }
  | { type: "scroll"; target: string; ms: number; block?: ScrollLogicalPosition };
type Shot = { id: string; route: string; sidebarCollapsed: boolean; posterAtMs: number; steps: Step[] };
type Config = {
  baseUrl: string;
  login: { path: string; emailEnv: string; passwordEnv: string };
  viewport: { width: number; height: number; deviceScaleFactor: number };
  sidebarStorageKey: string;
  hideSelectors: string[];
  cursor: { size: number; speedPxPerSec: number; minMoveMs: number; holdBeforeClickMs: number; clickRippleMs: number; settleAfterClickMs: number; fps: number };
  encode: { fps: number; maxBytes: number; crfLadder: number[]; preset: string };
  out: { videos: string; posters: string };
  mockApi?: string;
  resetDecisions?: { list: string; patch: string; status: string };
  stills: { homeStill: { route: string; file: string; waitMs: number }; homeAfter: { route: string; file: string; width: number; height: number; fullPage: boolean; waitMs: number } };
  shots: Shot[];
};

const only = process.argv[2];
const email = process.env[config.login.emailEnv];
const password = process.env[config.login.passwordEnv];
if (!email || !password) {
  console.error(`Set ${config.login.emailEnv} and ${config.login.passwordEnv} in the environment (the dev workspace accepts any pair). Nothing is read from the repo.`);
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------- page prep ---------- */
const HIDE_CSS = `${config.hideSelectors.join(",")}{display:none!important}
*::-webkit-scrollbar{display:none!important} *{scrollbar-width:none!important}`;

async function prep(ctx: BrowserContext, collapsed: boolean) {
  await ctx.addInitScript(({ css, key, collapsed, size }: { css: string; key: string; collapsed: boolean; size: number }) => {
    try { localStorage.setItem(key, collapsed ? "1" : "0"); } catch {}
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
      const c = document.createElement("div"); c.id = "__capcursor";
      c.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3l14 8.5-6.2 1.4L9.5 19 5 3z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
      Object.assign(c.style, { position: "fixed", left: "0px", top: "0px", zIndex: "2147483647", pointerEvents: "none", transform: "translate(-2px,-2px)", opacity: "0", transition: "opacity 200ms", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" });
      document.body.appendChild(c);
      (window as unknown as { __cap: { x: number; y: number } }).__cap = { x: 0, y: 0 };
    });
  }, { css: HIDE_CSS, key: config.sidebarStorageKey, collapsed, size: config.cursor.size });
}

async function login(page: Page) {
  await page.goto(config.baseUrl + config.login.path, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Email" }).fill(email!);
  await page.getByRole("textbox", { name: "Password" }).fill(password!);
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/signin"), { timeout: 20000 }), page.getByRole("button", { name: "Sign in" }).click()]);
}

/* ---------- cursor ---------- */
async function placeCursor(page: Page, x: number, y: number, show = true) {
  await page.mouse.move(x, y);
  await page.evaluate(({ x, y, show }) => {
    const c = document.getElementById("__capcursor");
    if (!c) return;
    c.style.left = `${x}px`; c.style.top = `${y}px`; c.style.opacity = show ? "1" : "0";
    (window as unknown as { __cap: { x: number; y: number } }).__cap = { x, y };
  }, { x, y, show });
}

async function resolveTarget(page: Page, target: string): Promise<{ x: number; y: number }> {
  if (target === "@peakBar") {
    // the tallest bar in the daily spend chart (the hit area is the svg; hovering its x shows the tip)
    const box = await page.evaluate(() => {
      // stacked charts wrap each day's rects in a <g class="tr-chart-bar">; flat ones use the rect itself
      const bars = Array.from(document.querySelectorAll(".tr-chart-bar")) as SVGGraphicsElement[];
      let best: SVGGraphicsElement | null = null, h = -1;
      for (const b of bars) { const r = b.getBoundingClientRect(); if (r.height > h) { h = r.height; best = b; } }
      if (!best) return null;
      const r = best.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + Math.min(40, r.height / 2) };
    });
    if (!box) throw new Error("no chart bars found for @peakBar");
    return box;
  }
  const loc = page.locator(target).first();
  await loc.waitFor({ state: "visible", timeout: 8000 });
  const r = await loc.boundingBox();
  if (!r) throw new Error(`no box for ${target}`);
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}

async function moveTo(page: Page, to: { x: number; y: number }) {
  const from = await page.evaluate(() => (window as unknown as { __cap: { x: number; y: number } }).__cap);
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const ms = Math.max(config.cursor.minMoveMs, (dist / config.cursor.speedPxPerSec) * 1000);
  const frames = Math.max(2, Math.round((ms / 1000) * config.cursor.fps));
  for (let i = 1; i <= frames; i++) {
    const t = easeInOut(i / frames);
    await placeCursor(page, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    await sleep(1000 / config.cursor.fps);
  }
}

async function click(page: Page) {
  await sleep(config.cursor.holdBeforeClickMs);
  await page.evaluate((ms) => {
    const c = document.getElementById("__capcursor");
    if (!c) return;
    const r = document.createElement("div");
    Object.assign(r.style, { position: "fixed", left: c.style.left, top: c.style.top, width: "28px", height: "28px", marginLeft: "-14px", marginTop: "-14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 0 0 1px rgba(0,0,0,0.35)", zIndex: "2147483646", pointerEvents: "none", opacity: "0.9", transform: "scale(0.3)", transition: `transform ${ms}ms cubic-bezier(0.2,0.8,0.2,1), opacity ${ms}ms ease-out` });
    document.body.appendChild(r);
    requestAnimationFrame(() => { r.style.transform = "scale(1.4)"; r.style.opacity = "0"; });
    setTimeout(() => r.remove(), ms + 50);
  }, config.cursor.clickRippleMs);
  const { x, y } = await page.evaluate(() => (window as unknown as { __cap: { x: number; y: number } }).__cap);
  await page.mouse.click(x, y);
  await sleep(config.cursor.settleAfterClickMs);
}

async function smoothScroll(page: Page, target: string, ms: number, block: ScrollLogicalPosition = "center") {
  const loc = page.locator(target).first();
  await loc.waitFor({ state: "attached", timeout: 8000 });
  const r = await loc.boundingBox();
  if (!r) return;
  const offset = block === "center" ? r.y + r.height / 2 - config.viewport.height / 2 : r.y - 24;
  // the scroll runs in the page as source text: tsx's compiled helpers (__name) do not exist there
  await page.evaluate(`(async () => {
    const start = window.scrollY, end = Math.max(0, start + ${offset}), ms = ${ms}, t0 = performance.now();
    await new Promise((done) => {
      const frame = (now) => {
        const t = Math.min(1, (now - t0) / ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, start + (end - start) * e);
        if (t < 1) requestAnimationFrame(frame); else done();
      };
      requestAnimationFrame(frame);
    });
  })()`);
}

/* the dev mock remembers accepted / deferred recommendations in memory, so
   every recording starts by putting them all back to pending */
async function resetDecisions() {
  if (!config.mockApi || !config.resetDecisions) return;
  const r = config.resetDecisions;
  const list = (await (await fetch(config.mockApi + r.list)).json()) as { agent_id: string; rec_type: string; status: string }[];
  for (const d of list) {
    if (d.status === r.status) continue;
    await fetch(config.mockApi + r.patch.replace("{agent_id}", d.agent_id).replace("{rec_type}", d.rec_type), { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: r.status }) });
  }
}

/* ---------- a shot ---------- */
async function record(shot: Shot, tmp: string) {
  await resetDecisions();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: config.viewport.width, height: config.viewport.height },
    deviceScaleFactor: config.viewport.deviceScaleFactor,
    recordVideo: { dir: tmp, size: { width: config.viewport.width * config.viewport.deviceScaleFactor, height: config.viewport.height * config.viewport.deviceScaleFactor } },
    reducedMotion: "no-preference",
  });
  await prep(ctx, shot.sidebarCollapsed);
  const page = await ctx.newPage();
  const recordingStart = Date.now(); // the video starts with the page; sign-in and navigation are trimmed off below
  await login(page);
  await page.goto(config.baseUrl + shot.route, { waitUntil: "networkidle" });
  await placeCursor(page, config.viewport.width * 0.55, config.viewport.height * 0.6);
  const t0 = Date.now();
  let posterTaken = false;
  const posterPath = path.join(ROOT, config.out.posters, `${shot.id}.jpg`);
  const maybePoster = async () => {
    if (posterTaken || Date.now() - t0 < shot.posterAtMs) return;
    posterTaken = true;
    await page.screenshot({ path: posterPath, type: "jpeg", quality: 86 });
  };
  for (const step of shot.steps) {
    if (step.type === "wait") { const end = Date.now() + step.ms; while (Date.now() < end) { await maybePoster(); await sleep(50); } }
    else if (step.type === "waitFor") { await page.locator(step.target).first().waitFor({ state: "visible", timeout: step.ms ?? 8000 }); }
    else if (step.type === "move") { await moveTo(page, await resolveTarget(page, step.target)); await maybePoster(); }
    else if (step.type === "click") { await click(page); await maybePoster(); }
    else if (step.type === "scroll") { await smoothScroll(page, step.target, step.ms, step.block); await maybePoster(); }
  }
  if (!posterTaken) await page.screenshot({ path: posterPath, type: "jpeg", quality: 86 });
  const totalMs = Date.now() - t0;
  const video = page.video();
  await ctx.close();
  await browser.close();
  const webm = await video!.path();
  return { webm, totalMs, posterPath, trimMs: t0 - recordingStart };
}

async function encode(webm: string, id: string, trimMs: number): Promise<{ mp4: string; bytes: number; crf: number }> {
  const mp4 = path.join(ROOT, config.out.videos, `${id}.mp4`);
  for (const crf of config.encode.crfLadder) {
    const r = spawnSync(ffmpeg, ["-y", "-loglevel", "error", "-ss", (trimMs / 1000).toFixed(2), "-i", webm, "-an", "-r", String(config.encode.fps), "-c:v", "libx264", "-preset", config.encode.preset, "-crf", String(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", mp4], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`ffmpeg failed for ${id} at crf ${crf}`);
    const bytes = (await fs.stat(mp4)).size;
    if (bytes <= config.encode.maxBytes) return { mp4, bytes, crf };
  }
  const bytes = (await fs.stat(mp4)).size;
  return { mp4, bytes, crf: config.encode.crfLadder.at(-1)! };
}

/* ---------- stills for the coded animations ---------- */
async function stills() {
  const browser = await chromium.launch();
  const s1 = config.stills.homeStill;
  {
    const ctx = await browser.newContext({ viewport: { width: config.viewport.width, height: config.viewport.height }, deviceScaleFactor: config.viewport.deviceScaleFactor });
    await prep(ctx, false);
    const page = await ctx.newPage();
    await login(page);
    await page.goto(config.baseUrl + s1.route, { waitUntil: "networkidle" });
    await sleep(s1.waitMs);
    await page.screenshot({ path: path.join(ROOT, s1.file), type: "png" });
    await ctx.close();
  }
  const s2 = config.stills.homeAfter;
  {
    const ctx = await browser.newContext({ viewport: { width: s2.width, height: s2.height }, deviceScaleFactor: 1 });
    await prep(ctx, false);
    const page = await ctx.newPage();
    await login(page);
    await page.goto(config.baseUrl + s2.route, { waitUntil: "networkidle" });
    await sleep(s2.waitMs);
    await page.evaluate(() => { const c = document.getElementById("__capcursor"); if (c) c.remove(); });
    await page.screenshot({ path: path.join(ROOT, s2.file), type: "png", fullPage: s2.fullPage });
    await ctx.close();
  }
  await browser.close();
}

/* ---------- main ---------- */
async function main() {
  await fs.mkdir(path.join(ROOT, config.out.videos), { recursive: true });
  await fs.mkdir(path.join(ROOT, config.out.posters), { recursive: true });
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "traeco-capture-"));
  const results: string[] = [];
  if (!only || only === "stills") { await stills(); results.push(`stills: ${config.stills.homeStill.file}, ${config.stills.homeAfter.file}`); }
  for (const shot of config.shots) {
    if (only && only !== shot.id) continue;
    const { webm, totalMs, posterPath, trimMs } = await record(shot, tmp);
    const { mp4, bytes, crf } = await encode(webm, shot.id, trimMs);
    results.push(`${shot.id}: ${(totalMs / 1000).toFixed(1)}s, ${path.relative(ROOT, mp4)} ${(bytes / 1024).toFixed(0)} KB (crf ${crf}), poster ${path.relative(ROOT, posterPath)}`);
  }
  await fs.rm(tmp, { recursive: true, force: true });
  console.log(results.join("\n"));
}
main().catch((e) => { console.error(e); process.exit(1); });
