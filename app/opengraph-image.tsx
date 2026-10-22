import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/*
  OG card (2026-10-21): the home page itself, at card size. White paper,
  the ASCII sky across the top, the nav pill, the name and tagline in the
  body face, two work cards on the right carrying their real art (no
  titles, no pills; Margaret, 2026-10-21), and the hills with the ball and
  the dog along the bottom. The sky and hills are rows of characters laid
  out in fixed-width cells, so they read the same whatever font renders
  them (the card has no mono face loaded).
*/

export const alt = "Margaret Luwena, a designer that engineers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SKY = "#8fa0c8";
const SKY_DENSE = "#6d82b6";
const HILL = "#9aa36a";
const DOG = "#9a9a9a";
const PETALS = ["#e8788d", "#6b8ee6", "#e3b84c", "#f0a06a"];

/* a deterministic hash, so the card is the same every time */
const hash = (x: number, y: number) => {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + 1103515245) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/* value noise, two octaves, enough for a cloud bank */
const noise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const cloud = (x: number, y: number) => 0.65 * noise(x * 0.09, y * 0.22) + 0.35 * noise(x * 0.21 + 7, y * 0.5 + 3);

const COLS = 150, CELL = 8, ROW = 11;
const RAMP = [".", ":", "-", "=", "+", "x", "X"];

function skyRows(rows: number) {
  const out: { ch: string; color: string; op: number }[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: { ch: string; color: string; op: number }[] = [];
    const fade = 1 - smooth(rows * 0.45, rows, r); // the sky thins toward the page
    for (let c = 0; c < COLS; c++) {
      const v = cloud(c, r) - 0.47;
      const cov = smooth(-0.02, 0.1, v);
      const open = fade * (1 - cov);
      let ch = " ", color = SKY, op = 1;
      if (open > 0.12) {
        ch = RAMP[Math.min(RAMP.length - 1, Math.floor(open * RAMP.length))];
        color = open > 0.6 ? SKY_DENSE : SKY;
        op = 0.55 + open * 0.45;
      } else if (cov > 0.15 && hash(c, r + 99) < 0.08) {
        ch = ".";
        op = 0.5;
      }
      row.push({ ch, color, op });
    }
    out.push(row);
  }
  return out;
}

function Row({ cells, y }: { cells: { ch: string; color: string; op: number }[]; y: number }) {
  return (
    <div style={{ position: "absolute", left: 0, top: y, display: "flex", height: ROW }}>
      {cells.map((cell, i) => (
        <div
          key={i}
          style={{
            width: CELL,
            display: "flex",
            justifyContent: "center",
            fontSize: 10,
            lineHeight: `${ROW}px`,
            color: cell.color,
            opacity: cell.op,
          }}
        >
          {cell.ch}
        </div>
      ))}
    </div>
  );
}

/* Manrope as static TTFs from Google Fonts (the repo's variable TTF is not
   something the OG renderer can parse); a failed fetch falls back to the
   renderer's default face rather than failing the card */
async function font(weight: 500 | 700) {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Manrope:wght@${weight}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/109.0" },
    }).then((r) => r.text());
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|woff)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

/* the card art, inlined as data URIs from /public (the OG renderer takes no
   relative URLs); the geometry is the home cards' own, from lib/works.ts */
async function art(file: string) {
  const buf = await readFile(join(process.cwd(), "public/images/covers", file));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

export default async function OG() {
  const [m500, m700, markHand, markLower, markTop, traecoLaptop, traecoDash] = await Promise.all([
    font(500), font(700),
    art("mark-hand-tilt.png"), art("mark-device-lower.png"), art("mark-device-top.png"),
    art("traeco-laptop.png"), art("traeco-dashboard.png"),
  ]);
  const fonts = [
    ...(m500 ? [{ name: "Manrope", data: m500, weight: 500 as const, style: "normal" as const }] : []),
    ...(m700 ? [{ name: "Manrope", data: m700, weight: 700 as const, style: "normal" as const }] : []),
  ];
  const sky = skyRows(17);

  /* the hills: three dashed ridges, flowers above the front one, the ball and the dog */
  const ridges = [
    { y: 520, segs: [[0, 18], [26, 52], [60, 71], [84, 110], [118, 150]], op: 0.45 },
    { y: 560, segs: [[0, 9], [14, 40], [48, 70], [77, 96], [103, 150]], op: 0.6 },
    { y: 598, segs: [[0, 150]], op: 0.7 },
  ];
  const flowers = [
    { c: 14, y: 585, g: "{o}" }, { c: 33, y: 590, g: "\\|/" }, { c: 58, y: 587, g: "(@)" }, { c: 88, y: 591, g: "'o'" },
    { c: 112, y: 586, g: "vUv" }, { c: 131, y: 589, g: "\\V/" },
  ];
  const specks = Array.from({ length: 34 }, (_, i) => ({
    c: Math.floor(hash(i, 5) * 150), y: 526 + Math.floor(hash(i, 9) * 70), color: PETALS[i % 4], ch: hash(i, 3) < 0.5 ? "*" : ".",
  }));
  const dog = ["   @@@@", "  @@@@@@@@   @@", " @@@.@@@@@  @@", "  @@@ @@@@@@@@@@@@@", "     @@@@@@@@@@@", "     @@@@   @@@@", "     @@@    @@@"];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", position: "relative", fontFamily: "Manrope" }}>
        {/* the sky */}
        {sky.map((cells, r) => (
          <Row key={r} cells={cells} y={r * ROW} />
        ))}

        {/* the nav pill */}
        <div
          style={{
            position: "absolute", left: 96, right: 96, top: 44, height: 44, display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "0 20px", borderRadius: 999, background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(0,0,0,0.17)", boxShadow: "0 8px 19px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", fontSize: 13, letterSpacing: 2, color: "rgba(0,0,0,0.7)" }}>ABOUT + WORKS + PLAY</div>
          <div style={{ display: "flex", gap: 7 }}>
            {[1, 0.25, 0.25, 0.25].map((o, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: 999, background: `rgba(0,0,0,${o})` }} />
            ))}
          </div>
        </div>

        {/* name, tagline, contact row */}
        <div style={{ position: "absolute", left: 96, top: 196, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -0.6, color: "#000", fontFamily: "Manrope" }}>MARGARET LUWENA</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 38, color: "#000", transform: "skewX(-9deg)" }}>is a designer that engineers</div>
          <div style={{ display: "flex", marginTop: 26, gap: 14, fontSize: 15, color: "rgba(0,0,0,0.55)", letterSpacing: 1 }}>
            <div style={{ display: "flex" }}>LINKEDIN</div>
            <div style={{ display: "flex" }}>X</div>
            <div style={{ display: "flex" }}>LUWENA@USC.EDU</div>
          </div>
          <div style={{ display: "flex", marginTop: 46, width: 400, fontSize: 18, lineHeight: 1.45, color: "#000" }}>
            Currently a designer cofounding Traeco, where I lead product and design for a platform that helps teams track and govern what their AI agents spend.
          </div>
        </div>

        {/* the hills */}
        {ridges.map((rg, i) =>
          rg.segs.map(([a, b], k) => (
            <div key={`${i}-${k}`} style={{ position: "absolute", left: a * CELL, top: rg.y, display: "flex", color: HILL, opacity: rg.op, fontSize: 10, letterSpacing: 3 }}>
              {"-".repeat(Math.max(1, Math.floor((b - a) * 0.72)))}
            </div>
          ))
        )}
        {specks.map((sp, i) => (
          <div key={i} style={{ position: "absolute", left: sp.c * CELL, top: sp.y, display: "flex", fontSize: 10, color: sp.color, opacity: 0.8 }}>{sp.ch}</div>
        ))}
        {flowers.map((f, i) => (
          <div key={i} style={{ position: "absolute", left: f.c * CELL, top: f.y, display: "flex", flexDirection: "column", alignItems: "center", fontSize: 10, lineHeight: "11px", color: PETALS[i % 4] }}>
            <div style={{ display: "flex" }}>{f.g}</div>
            <div style={{ display: "flex", color: HILL }}>|</div>
          </div>
        ))}
        {/* the ball */}
        <div style={{ position: "absolute", left: 206, top: 583, width: 16, height: 16, borderRadius: 999, background: "#cde23a", border: "1px solid rgba(0,0,0,0.22)", display: "flex" }} />
        {/* the dog, facing the ball */}
        <div style={{ position: "absolute", left: 236, top: 540, display: "flex", flexDirection: "column", fontSize: 9, lineHeight: "8px", color: DOG, whiteSpace: "pre" }}>
          {dog.map((ln, i) => (
            <div key={i} style={{ display: "flex" }}>{ln}</div>
          ))}
        </div>
        {/* two work cards, as they sit in the home column: their art only */}
        {/* Mark: the hand, the lower device, the device close-up (Figma 255:586 geometry) */}
        <div style={{ position: "absolute", left: 700, top: 120, width: 404, height: 282, display: "flex", borderRadius: 10, background: "#ffffff", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 10px 50px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <img src={markHand} alt="" style={{ position: "absolute", left: "10.02%", top: "27.08%", width: "74.63%", height: "71.33%", objectFit: "contain", transform: "rotate(-3.82deg)" }} />
          <img src={markLower} alt="" style={{ position: "absolute", left: "6.63%", top: "37.82%", width: "97.28%", height: "78.45%", objectFit: "contain", transform: "rotate(-12.18deg)" }} />
          <div style={{ position: "absolute", left: "30.35%", top: "4.43%", width: "42.48%", height: "30.79%", display: "flex", overflow: "hidden", transform: "rotate(2.82deg)" }}>
            <img src={markTop} alt="" style={{ position: "absolute", left: "-39.56%", top: "-78.8%", width: "139.57%", height: "345.11%", objectFit: "fill" }} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, display: "flex", background: "linear-gradient(to bottom, rgba(255,255,255,0), #ffffff 77.9%)" }} />
        </div>
        {/* Traeco: the laptop under the floating dashboard (Figma 139:559), cut by the card's edge */}
        <div style={{ position: "absolute", left: 700, top: 428, width: 404, height: 282, display: "flex", borderRadius: 10, background: "#303036", border: "1px solid rgba(0,0,0,0.09)", overflow: "hidden" }}>
          <img src={traecoLaptop} alt="" style={{ position: "absolute", left: "-1.95%", top: "9.29%", width: "103.81%", height: "86%", objectFit: "contain" }} />
          <img src={traecoDash} alt="" style={{ position: "absolute", left: "8.96%", top: "12.17%", width: "81.55%", height: "72.22%", objectFit: "contain" }} />
          <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, display: "flex", background: "linear-gradient(to bottom, rgba(36,36,40,0), rgba(36,36,40,0.03) 37.5%, #242428 77.9%)" }} />
        </div>

      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) }
  );
}
