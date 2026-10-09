// Records the pixel size of every image under public/images into
// lib/image-sizes.json, so MediaView can render each one at its real aspect
// and never larger than its pixels allow (no upscaling on 2x screens).
// Run after adding images: `npm run images`. Uses macOS `sips`.
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = "public";
const out = {};
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (![".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extname(name).toLowerCase())) continue;
    const txt = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", p], { encoding: "utf8" });
    const w = +(/pixelWidth:\s*(\d+)/.exec(txt)?.[1] ?? 0), h = +(/pixelHeight:\s*(\d+)/.exec(txt)?.[1] ?? 0);
    if (w && h) out["/" + relative(ROOT, p).split("\\").join("/")] = [w, h];
  }
};
walk(join(ROOT, "images"));
const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
writeFileSync("lib/image-sizes.json", JSON.stringify(sorted, null, 2) + "\n");
console.log(`lib/image-sizes.json: ${Object.keys(sorted).length} images`);
