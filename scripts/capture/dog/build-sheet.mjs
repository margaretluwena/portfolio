// Renders every dog frame to scripts/capture/dog/frames.html (the sheet the
// capture script screenshots to public/images/about/dog-frames.png).
import { DOG } from "../../../components/sky-field/dog-frames.mjs";
import { writeFileSync } from "node:fs";
const sets = [
  ["run", DOG.run, ["stretched", "mid-stride", "tucked"]],
  ["sit", DOG.sit, ["ear up", "ear settled"]],
  ["lie", DOG.lie, ["head up", "chin on paws"]],
  ["spin", [DOG.sit[0], DOG.view.away, DOG.view.back, DOG.view.toward, DOG.view.front], ["side", "three-quarter away", "back", "three-quarter toward", "front"]],
  ["bow", DOG.bow, ["play bow"]],
];
const cell = (rows, eyes, opts) => {
  const lines = rows.map((r, y) => [...r].map((g, x) => {
    const eye = (eyes || []).find(([c, rr]) => c === x && rr === y);
    if (eye) return `<i class="${opts.closed ? "shut" : opts.front ? "front" : "eye"}"></i>`;
    return g === "@" ? '<b>@</b>' : "&nbsp;";
  }).join("")).join("\n");
  return `<pre>${lines}</pre>`;
};
let body = "";
for (const [name, frames, labels] of sets) {
  body += `<section><h2>${name}</h2><div class="row">` + frames.map((f, i) => `<figure>${cell(f, f.eyes, f)}<figcaption>${labels[i] ?? ""}</figcaption></figure>`).join("") + `</div></section>`;
}
writeFileSync(new URL("./frames.html", import.meta.url), `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>Dog frames</title>
<style>
  @font-face { font-family: "Plex"; src: local("IBM Plex Mono"), local("IBMPlexMono"); }
  html, body { margin: 0; } body { width: 1128px; background: #f6f5f1; color: #111; font-family: -apple-system, "Inter", system-ui, sans-serif; padding: 28px 36px 20px; box-sizing: border-box; }
  h2 { margin: 0 0 8px; font-family: ui-monospace, Menlo, monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #777; }
  section { margin-bottom: 22px; } .row { display: flex; gap: 18px; flex-wrap: wrap; }
  figure { margin: 0; display: grid; gap: 6px; }
  pre { margin: 0; font-family: "IBM Plex Mono", "Plex", ui-monospace, Menlo, monospace; font-size: 9px; line-height: 11px; letter-spacing: 0; background: #e8ecef; padding: 8px 6px; border-radius: 4px; width: 144px; }
  pre b { font-weight: 400; color: #2b2b2b; } pre i { display: inline-block; width: 6px; height: 11px; position: relative; vertical-align: top; }
  pre i.eye:after, pre i.front:after { content: ""; position: absolute; left: 0; top: 2px; width: 6px; height: 6px; border-radius: 50%; background: #fff; }
  pre i.eye:before, pre i.front:before { content: ""; position: absolute; left: 2px; top: 4px; width: 3px; height: 3px; border-radius: 50%; background: #111; z-index: 1; } pre i.front:before { left: 1.5px; }
  pre i.shut:after { content: ""; position: absolute; left: 0; top: 5px; width: 6px; height: 1.5px; background: #fff; }
  figcaption { font-size: 11px; color: #666; }
</style></head><body>${body}</body></html>`);
console.log("frames.html written");
