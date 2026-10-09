// Sky Field: an animated ASCII sky with drifting clouds over rolling hills of flowers,
// plus a tennis ball you can shake to summon a poodle and play fetch.
// No dependencies. Usage: const field = createSkyField(canvas, options); field.destroy();

const DEFAULT_COLORS = {
  background: '#ffffff',
  sky: '#8a9ec0', skyDense: '#4e6894',
  cloudShade: '#c2c7cf', cloudShadeDeep: '#9aa2ae',
  farRidge: '#a3b2aa', farTexture: '#cdd5d0',
  domeRidge: '#55743a', domeShadow: '#b3c3a1', domeLit: '#7c9a59',
  frontRidge: '#486630', grass: '#86a466', ground: '#c5cdbc',
  petals: ['#e0558d', '#e2603f', '#4d82c9', '#d9a521'], flowerCenter: '#b07c22',
  poodle: '#1b1b1b', poodleFace: '#1b1b1b', poodleLegs: '#1b1b1b',
  ballRim: '#cde23a', ballSeam: '#fbfdf0', hint: '#1b1b1b',
  trail: '#8d8d8d',
};

const RAMPS = { dither: '.:-=+xX', ascii: '.-=+*#%', stars: '.·:+*', binary: '01' };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const TYPES = [{ h: ['\\V/'], s: 2 }, { h: ['(@)'], s: 2 }, { h: [' _ ', '(_)'], s: 2 }, { h: ['.*.'], s: 1 },
  { h: ['{o}'], s: 3 }, { h: [' , ', "'o'"], s: 2 }, { h: ['*'], s: 1 }, { h: ['vUv'], s: 2 }];
const CENTERS = '@o*';
// dog sprites face right (mirrored to face left): a filled side-view silhouette,
// which is how a dog reads at this size - domed head, ear flap folded back over
// the neck, the eye and mouth left as gaps, a long muzzle, tail up at the rear,
// four legs (tucked, stretched, mid-stride, or folded under when sitting). '@' is fill.
const DOG = {
  run: [["                 @@@@@  ",
       "   @@          @@@@@@@@ ",
       "    @@        @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@      @@@@     ",
       "     @@@@      @@@@     "],
       ["                 @@@@@  ",
       "   @@          @@@@@@@@ ",
       "    @@        @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "     @@@        @@@@    ",
       "   @@@@          @@@@   "],
       ["                 @@@@@  ",
       "   @@          @@@@@@@@ ",
       "    @@        @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@       @@@@    ",
       "     @@@@       @@@@    "]],
  sit: [["                 @@@@@  ",
       "   @@          @@@@@@@@ ",
       "    @@        @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "     @@@@@     @@@@     ",
       "    @@@@@@@    @@@@     "],
       ["                 @@@@@  ",
       "  @@           @@@@@@@@ ",
       "   @@         @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "     @@@@@     @@@@     ",
       "    @@@@@@@    @@@@     "]],
};
const MIRROR = { '/': '\\', '\\': '/', '(': ')', ')': '(', '<': '>', '>': '<' };
const DOGW = 24, DOGH = 8, MOUTH = 3, EYE_COL = 20, EYE_ROW = 2; // 24x8 (was 30x10 - "slightly smaller", 2026-10-08)
const INTERACTIVE = 'a,button,input,textarea,select,label,summary,[role="button"],[contenteditable],[data-sky-ignore]';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function mulberry(a) {
  return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function createSkyField(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  const P = {
    cellSize: 9, wind: 1, cover: 0.55, depth: 0.85, flowers: 1, hills: 1, bumps: 1, hillTexture: 1, ramp: 'dither',
    onThrow: null, onCount: null, onHover: null, onAction: null,
    seed: (Math.random() * 1e6) | 0, game: true, hint: 'shake me', ballX: 0.62, maxFps: 30,
    fontFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    ...options,
  };
  const C = { ...DEFAULT_COLORS, ...(options.colors || {}) };
  let COLORS = [];
  // colour slots used by the character grid; 0 means empty
  function buildPalette() {
    COLORS = [null, C.sky, C.skyDense, C.cloudShade, C.cloudShadeDeep, C.farRidge, C.farTexture,
      C.domeRidge, C.domeRidge, C.domeShadow, C.domeLit, C.frontRidge, C.frontRidge, C.grass, C.ground,
      ...C.petals.slice(0, 4), C.flowerCenter, C.poodle, C.poodleFace, C.poodleLegs, C.ballRim, C.ballSeam, C.hint, C.trail];
  }
  buildPalette();
  const PETAL = 15, CENTER = 19, STEM = 13, TRAIL = 26;

  const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, cols = 0, rows = 0, cw = 6, ch = 11;
  let chars = [], col = new Uint8Array(0), hillCh = [], hillCol = new Uint8Array(0), skyLimit = new Int16Array(0);
  let frontTop = new Int16Array(0), frontTopF = null, flowers = [];
  let seed = P.seed | 0, T = 0, last = 0, dirty = true, raf = 0, destroyed = false, drift = 0, F = null;
  /* Motion style (2026-10-08, after the ostrich clip): things in motion are
     not solid. Cloud edges and a moving dog shed and regather their cells -
     some drop out for a frame, some render at a smaller glyph size - so the
     grid itself reads as the animation. `smalls` collects the cells drawn
     at the reduced size in a second pass; `G.trail` holds the pixels the
     dog leaves behind while they blow away. Reduced motion renders solid. */
  let smalls = [];
  const SMALL = 0.68; // small-glyph scale

  function hash(x, y) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed, 1103515245)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, o) { let s = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < o; i++) { s += a * vnoise(x * f + i * 17.3, y * f - i * 9.1); n += a; f *= 2.03; a *= 0.5; } return s / n; }
  // warped fbm gives billowing, irregular cloud shapes that are wider than they are tall
  function cloudField(px, py) {
    const x = px / 320 - drift, y = py / 115;
    const wx = fbm(x * 0.6 + T * 0.02, y * 0.45, 2), wy = fbm(x * 0.6 + 5.2, y * 0.45 - T * 0.015, 2);
    return fbm(x + 2.6 * (wx - 0.5), y + 1.2 * (wy - 0.5) + T * 0.008, 5);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = `${P.cellSize}px ${P.fontFamily}`; ctx.textBaseline = 'top';
    cw = ctx.measureText('M').width; ch = Math.round(P.cellSize * 1.18);
    cols = Math.ceil(W / cw) + 1; rows = Math.ceil(H / ch);
    col = new Uint8Array(rows * cols);
    buildHills(); buildFlowers(); placeBall(); dirty = true;
  }

  /* ---------- hills: three layers of gentle domes, back to front ---------- */
  function bumpsTop(base, bumps) { const a = new Float32Array(cols);
    for (let c = 0; c < cols; c++) { const x = c * cw; let h = base;
      for (const b of bumps) h -= b.a * Math.exp(-(((x - b.mu) / b.s) ** 2)); a[c] = clamp(rows * h, 1, rows + 2); }
    return a; }
  // one flat character: the old high/mid/low split read as a jittery line
  const flatChar = () => '-';
  function lineSegs(arr) { const out = new Array(cols);
    for (let c = 0; c < cols; c++) { const y = arr[c], L = c > 0 ? arr[c - 1] : y, R = c < cols - 1 ? arr[c + 1] : y, s = (R - L) / 2, r = Math.floor(y);
      const segs = [[r, s < -0.5 ? '/' : s > 0.5 ? '\\' : flatChar(y - r)]];
      for (let q = Math.floor(R) + 1; q < r; q++) segs.push([q, '/']);
      for (let q = Math.floor(L) + 1; q < r; q++) segs.push([q, '\\']);
      out[c] = segs; }
    return out; }

  function buildHills() {
    const rng = mulberry(seed); const R = (a, b) => a + rng() * (b - a);
    // P.hills sinks every layer toward the bottom edge (base lines and bumps together);
    // P.bumps then scales the bumps alone, so low hills can still roll
    const hs = clamp(P.hills, 0.1, 1.5), bs = clamp(P.bumps, 0, 3), base = (b) => 1 - (1 - b) * hs, amp = (a) => a * hs * bs;
    const far = { base: base(0.75), bumps: [], ridge: 5, kind: 'far' };
    for (let i = 0; i < 5; i++) far.bumps.push({ mu: R(-0.1, 1.1) * W, s: R(0.1, 0.2) * W, a: amp(R(0.012, 0.03)) });
    const domeX = R(0.5, 0.75);
    const dome = { base: base(0.88), ridge: 7, kind: 'dome', bumps: [
      { mu: domeX * W, s: R(0.2, 0.26) * W, a: amp(R(0.11, 0.14)) },
      { mu: R(0.08, 0.28) * W, s: R(0.16, 0.22) * W, a: amp(R(0.06, 0.09)) },
      { mu: (domeX + R(0.2, 0.32)) * W, s: R(0.1, 0.14) * W, a: amp(R(0.03, 0.05)) }] };
    const front = { base: base(0.9), ridge: 11, kind: 'front', bumps: [
      { mu: R(-0.05, 0.25) * W, s: R(0.26, 0.34) * W, a: amp(R(0.035, 0.05)) },
      { mu: R(0.85, 1.1) * W, s: R(0.22, 0.3) * W, a: amp(R(0.03, 0.045)) }] };
    hillCh = new Array(rows * cols).fill(' '); hillCol = new Uint8Array(rows * cols);
    skyLimit = new Int16Array(cols).fill(rows);
    const set = (r, c, s, k) => { if (r < 0 || r >= rows || c < 0 || c >= cols) return; const i = r * cols + c; hillCh[i] = s; hillCol[i] = k; };
    const tx = clamp(P.hillTexture, 0, 1.5); // 0 = bare slopes, 1 = original dither
    for (const L of [far, dome, front]) {
      const top = bumpsTop(L.base, L.bumps), segs = lineSegs(top);
      if (L.kind === 'front') frontTopF = top;
      L.topEff = new Int16Array(cols);
      for (let c = 0; c < cols; c++) {
        let te = rows; for (const s of segs[c]) te = Math.min(te, s[0]); L.topEff[c] = te;
        skyLimit[c] = Math.min(skyLimit[c], te);
        // light from the upper left: faces that fall away to the right sit in shadow
        const slope = (top[Math.min(cols - 1, c + 3)] - top[Math.max(0, c - 3)]) / 6;
        const lit = 1 - clamp(slope * 1.4 + 0.3, 0, 1);
        for (let r = Math.max(te, 0); r < rows; r++) { const i = r * cols + c; hillCh[i] = ' '; hillCol[i] = 0;
          const dep = r - top[c]; if (dep < 1.5) continue;
          const b = (BAYER[(r & 3) * 4 + (c & 3)] + 0.5) / 16, h = hash(c + (L.kind === 'front' ? 500 : L.kind === 'dome' ? 250 : 0), r);
          if (L.kind === 'far') { if (h < 0.05 * tx) set(r, c, '.', 6); }
          else if (L.kind === 'dome') {
            const d = (0.06 + lit * 0.42) * clamp(1 - dep / (rows * 0.42), 0.15, 1) * tx;
            if (d > b) set(r, c, d > 0.3 ? ':' : '.', lit > 0.5 ? 10 : 9); else if (h < 0.02 * tx) set(r, c, "'", 9); }
          else { const d = lit * 0.12 * tx;
            if (d > b) set(r, c, '.', 13); else if (h < 0.05 * tx) set(r, c, ',', 13); else if (h < 0.08 * tx) set(r, c, '"', 13); else if (h < 0.09 * tx) set(r, c, '`', 14); }
        }
        for (const [r, s] of segs[c]) set(r, c, s, L.ridge);
      }
    }
    frontTop = front.topEff;
    // distant flowers dotted across the middle hill
    const n = Math.round(cols * 0.35 * P.flowers);
    for (let k = 0; k < n; k++) { const c = (rng() * cols) | 0; const lo = dome.topEff[c] + 2, hi = front.topEff[c] - 1; if (hi <= lo) continue;
      const r = lo + ((rng() * (hi - lo)) | 0), i = r * cols + c;
      if (hillCol[i] === 9 || hillCol[i] === 10 || hillCol[i] === 0) set(r, c, rng() < 0.6 ? '.' : '*', PETAL + ((rng() * 4) | 0)); }
  }

  function buildFlowers() {
    const rng = mulberry(seed ^ 0x9e3779b9);
    flowers = []; const taken = new Set();
    const n = Math.round(cols * P.flowers * 0.16); let tries = 0;
    while (flowers.length < n && tries++ < n * 25) {
      const c = 2 + ((rng() * (cols - 4)) | 0);
      const span = rows - frontTop[c] - 3; if (span < 1) continue;
      const base = frontTop[c] + 3 + ((rng() * span) | 0);
      const t = TYPES[(rng() * TYPES.length) | 0]; const hgt = t.h.length + t.s;
      if (base - hgt + 1 <= frontTop[c]) continue;
      let ok = true;
      for (let r = base - hgt; r <= base + 1 && ok; r++) for (let cc = c - 3; cc <= c + 3; cc++) if (taken.has(r * cols + cc)) { ok = false; break; }
      if (!ok) continue;
      for (let r = base - hgt; r <= base; r++) for (let cc = c - 2; cc <= c + 2; cc++) taken.add(r * cols + cc);
      flowers.push({ c, base, t, petal: PETAL + ((rng() * 4) | 0), phase: rng() * 6.28, leaf: rng() < 0.55 ? (rng() < 0.5 ? -1 : 1) : 0 });
    }
  }

  /* ---------- fetch game ---------- */
  const G = { t: 0, ball: { x: 0, y: 0, vx: 0, vy: 0, st: 'rest' },
    dog: { x: -200, st: 'away', face: 1, moving: false, jump: 0, jv: 0, home: 0, woof: 0, say: '', sayT: 0 },
    throws: null,
    grab: null, hist: [], shakes: [], lastDir: 0, met: false, labels: [], eyes: [], ballWig: 0, trail: [], dt: 0,
    throwsHere: 0, idle: 0 };
  const ballR = () => ch * 0.95;
  function groundAt(px) { if (!frontTopF) return H * 0.9; const f = clamp(px / cw, 0, cols - 1), i = Math.floor(f), t = f - i;
    const a = frontTopF[i], b = frontTopF[Math.min(cols - 1, i + 1)]; return (a + (b - a) * t) * ch; }
  function placeBall() { const b = G.ball; if (!b.x || b.x > W) b.x = W * clamp(P.ballX, 0.05, 0.95);
    if (b.st !== 'carried') { b.y = groundAt(b.x) - ballR(); b.vx = b.vy = 0; b.st = 'rest'; }
    if (G.dog.st !== 'away') G.dog.x = clamp(G.dog.x, 40, W - 40); }
  const mouthX = (d) => d.x + d.face * (DOGW / 2) * cw;
  function summon() {
    const d = G.dog; G.met = true;
    if (d.st === 'away') { const fromLeft = Math.random() < 0.5;
      d.x = fromLeft ? -DOGW * cw : W + DOGW * cw; d.face = fromLeft ? 1 : -1; d.st = 'enter'; }
    else { d.jv = -240; d.woof = 1; }
  }
  function moveDog(d, target, speed, dt) {
    // ease off over the last ~10 cells so the dog settles instead of stopping dead
    const dx = target - d.x, step = speed * dt * clamp(Math.abs(dx) / (cw * 10), 0.3, 1);
    if (Math.abs(dx) <= step) { d.x = target; d.moving = false; return true; }
    d.face = Math.sign(dx); d.x += d.face * step; d.moving = true; return false;
  }
  function updateGame(dt) {
    G.t += dt; G.dt = dt; const b = G.ball, d = G.dog, R = ballR();
    if (b.st === 'flying') {
      // a heavy ball (2026-10-08): strong gravity, a dead-ish bounce that only happens on a
      // real impact, and grass that kills the roll fast
      b.vy += 2400 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < cw) { b.x = cw; b.vx = Math.abs(b.vx) * 0.35; }
      if (b.x > W - cw) { b.x = W - cw; b.vx = -Math.abs(b.vx) * 0.35; }
      const gy = groundAt(b.x) - R;
      if (b.y >= gy) { b.y = gy;
        if (b.vy > 260) { b.vy = -b.vy * 0.28; b.vx *= 0.7; }
        else { b.vy = 0; b.vx *= Math.pow(0.02, dt); if (Math.abs(b.vx) < 12) { b.vx = 0; b.st = 'rest'; } } }
    } else if (b.st === 'rest') b.y = groundAt(b.x) - R;

    if (d.jv || d.jump < 0) { d.jv += 900 * dt; d.jump += d.jv * dt; if (d.jump >= 0) { d.jump = 0; d.jv = 0; } }
    d.woof = Math.max(0, d.woof - dt); d.sayT = Math.max(0, d.sayT - dt);
    // a minute of sitting together with nothing happening: the dog brings it up again itself
    G.idle = d.st === 'wait' && b.st === 'rest' && !G.grab ? G.idle + dt : 0;
    if (G.idle > 60) { G.idle = 0; if (P.onCount) announce((() => { try { return P.onCount(); } catch { return null; } })()); }
    if (d.st === 'enter') {
      if (moveDog(d, b.x - d.face * (DOGW / 2 + 2) * cw, 330, dt)) { d.st = 'wait'; d.woof = 1.2; d.face = Math.sign(b.x - d.x) || 1; }
    } else if (d.st === 'wait') {
      d.moving = false; if (b.st !== 'carried') d.face = Math.sign(b.x - d.x) || d.face;
    } else if (d.st === 'chase') {
      if (b.st === 'held') d.st = 'wait';
      else { const f = Math.sign(b.x - d.x) || d.face;
        // caught when the ball is low and anywhere along the dog's body - not only at the mouth,
        // so a ball that lands behind or under the dog is picked up instead of circled (2026-10-08)
        if (Math.abs(d.x - b.x) < (DOGW / 2 + 1.5) * cw && b.y > groundAt(b.x) - R - ch * 2.2) { b.st = 'carried'; d.st = 'return';
          if (G.throwsHere === 1) announce(G.throws); } // once, on the first catch of the visit
        else moveDog(d, b.x - f * (DOGW / 2) * cw, b.st === 'rest' ? 300 : 360, dt); }
    } else if (d.st === 'return') {
      if (moveDog(d, d.home, 260, dt)) { d.st = 'wait'; d.woof = 1.2;
        b.st = 'flying'; b.x = clamp(mouthX(d) + d.face * cw, cw, W - cw); b.vx = d.face * 40; b.vy = -60; }
    }
    if (b.st === 'carried') { b.x = mouthX(d) + d.face * cw; b.y = groundAt(d.x) - ch * (DOGH - MOUTH) + d.jump; }
  }
  const gameActive = () => P.game && (G.dog.st !== 'away' || G.ball.st !== 'rest' || !G.met);
  // the player line: `count` is the running total of people who've played, or a promise of it
  // (from P.onThrow / P.onCount - the host counts each visitor once and reads the total)
  function announce(count) {
    const d = G.dog;
    Promise.resolve(count).then((n) => {
      if (destroyed || typeof n !== 'number' || !isFinite(n)) return;
      d.say = n === 1 ? "you're the first person who's played with me!" : `you're one of ${n.toLocaleString()} people who've played with me!`;
      d.sayT = 4.5;
    }).catch(() => {});
  }

  function drawGame(put) {
    const d = G.dog, b = G.ball;
    if (d.st !== 'away') {
      const RUN = [0, 2, 1, 2], ph = Math.floor(G.t * 12) % 4; // stretched, mid, tucked, mid
      const spr = d.moving ? DOG.run[RUN[ph]] : DOG.sit[Math.floor(G.t * 4) % 2];
      const bob = d.moving && (ph & 1) ? -1 : 0; // the body lifts a row on the mid-stride frames
      const top = Math.floor(groundAt(d.x) / ch) - DOGH + Math.round(d.jump / ch) + bob;
      const left = Math.round(d.x / cw) - (DOGW >> 1);
      // the trail: pixels shed while running, blowing away over ~0.4s
      const dissolve = d.moving && !reduceMotion, fr = Math.floor(G.t * 18);
      for (let k = G.trail.length - 1; k >= 0; k--) { const g = G.trail[k]; g.age += G.dt;
        if (g.age > 0.4) { G.trail.splice(k, 1); continue; }
        if (g.age < 0.1) put(g.r, g.c, '%', TRAIL);
        else if (g.age < 0.22) smalls.push(g.r, g.c, '+', TRAIL);
        else smalls.push(g.r, g.c, '.', TRAIL); }
      for (let r = 0; r < DOGH; r++) { const line = spr[r];
        // clear the scenery behind the dog so its silhouette reads cleanly
        const t = line.trimEnd(), a = t.length - t.trimStart().length;
        for (let q = a; q < t.length; q++) put(top + r, left + (d.face > 0 ? q : DOGW - 1 - q), ' ', 0);
        for (let q = 0; q < DOGW; q++) { let g = d.face > 0 ? line[q] : line[DOGW - 1 - q]; if (!g || g === ' ') continue;
          if (d.face < 0 && MIRROR[g]) g = MIRROR[g];
          const k = g === '@' ? 20 : 'o<>\''.includes(g) ? 21 : 22;
          if (dissolve) {
            // 0 at the tail, 1 at the nose: the rear sheds, the front is still gathering itself
            const rel = d.face > 0 ? q / DOGW : 1 - q / DOGW, n = hash(q * 31 + fr * 7, r * 17 + fr);
            if (rel < 0.4 && n < 0.3 * (1 - rel / 0.4) + 0.06) { if (n < 0.14) G.trail.push({ r: top + r, c: left + q, age: 0 }); continue; }
            if (rel > 0.7 && n < 0.45) { smalls.push(top + r, left + q, '+', k); continue; }
          }
          put(top + r, left + q, g, k); } }
      if (d.sayT > 0) G.labels.push({ text: d.say, x: d.x, y: (top - 1) * ch, bubble: true, at: d.x + d.face * (DOGW / 4) * cw });
      else if (d.woof > 0) G.labels.push({ text: 'woof!', x: d.x, y: (top - 1) * ch, bubble: true, at: d.x + d.face * (DOGW / 4) * cw });
      // eyes: the sprite's eye gap (EYE_ROW/EYE_COL facing right) gets a real eye - white, a pupil
      // looking the way the dog faces, and a blink every few seconds
      const ec = left + (d.face > 0 ? EYE_COL : DOGW - 1 - EYE_COL);
      G.eyes.push({ x: (ec + 0.5) * cw, y: (top + EYE_ROW + 0.55) * ch, face: d.face, blink: G.t % 3.7 < 0.12 });
    }
    // the ball is drawn as a real circle after the grid (drawOverlay); it only wiggles here
    const wig = !G.met && b.st === 'rest' && G.t % 5 > 4.4 ? (Math.floor(G.t * 14) % 2 ? 1 : -1) : 0;
    G.ballWig = wig * cw * 0.6;
    // the hint: the moment the ball is picked up (until the dog has been met), and otherwise
    // only after a full minute of nobody touching it, fading in over 1.5s (2026-10-08)
    const HINT_AFTER = 60, HINT_FADE = 1.5;
    if (P.hint && !G.met && b.st === 'held')
      G.labels.push({ text: P.hint, x: b.x, y: b.y - ballR() * 2.4, alpha: 1 });
    else if (P.hint && !G.met && b.st === 'rest' && G.t > HINT_AFTER)
      G.labels.push({ text: P.hint, x: b.x, y: b.y - ballR() * 2.4, alpha: clamp((G.t - HINT_AFTER) / HINT_FADE, 0, 1) });
  }
  // after the character grid: the tennis ball, the dog's eyes, the bare hint, and speech in an
  // ASCII bubble - all set larger than the grid so they read over it
  function drawOverlay() {
    const b = G.ball, R = ballR(), bx = b.x + (G.ballWig || 0);
    if (P.game) {
      // a tennis ball: felt-green sphere lit from the upper left, with the two curved seams -
      // circles centred outside the ball on either side, clipped to it. Centres at 1.65R put
      // the seams 0.4R either side of the middle (1.35R had them 0.1R apart: "too close",
      // Margaret 2026-10-09)
      ctx.save(); ctx.beginPath(); ctx.arc(bx, b.y, R, 0, Math.PI * 2); ctx.clip();
      const g = ctx.createRadialGradient(bx - R * 0.4, b.y - R * 0.45, R * 0.1, bx, b.y, R * 1.05);
      g.addColorStop(0, '#e6f55a'); g.addColorStop(0.55, C.ballRim); g.addColorStop(1, '#8fa31c');
      ctx.fillStyle = g; ctx.fillRect(bx - R, b.y - R, R * 2, R * 2);
      ctx.strokeStyle = C.ballSeam; ctx.lineWidth = Math.max(1.2, R * 0.2);
      ctx.beginPath(); ctx.arc(bx - R * 1.65, b.y, R * 1.25, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx + R * 1.65, b.y, R * 1.25, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.arc(bx, b.y, R, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1; ctx.stroke();
      for (const e of G.eyes) {
        const r = ch * 0.5;
        if (e.blink) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, ch * 0.18); ctx.beginPath();
          ctx.moveTo(e.x - r, e.y); ctx.lineTo(e.x + r, e.y); ctx.stroke(); continue; }
        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.beginPath(); ctx.arc(e.x + e.face * r * 0.3, e.y, r * 0.5, 0, Math.PI * 2); ctx.fillStyle = C.poodle; ctx.fill();
      }
    }
    if (!G.labels.length) return;
    const fs = Math.round(P.cellSize * 1.75);
    ctx.font = `500 ${fs}px ${P.fontFamily}`; ctx.textBaseline = 'top';
    const gw = ctx.measureText('M').width, gh = fs * 1.2;
    for (const l of G.labels) {
      if (!l.bubble) {
        // the hint: bare text, nothing around it, fading in
        const tw = ctx.measureText(l.text).width;
        ctx.globalAlpha = l.alpha ?? 1;
        ctx.fillStyle = C.hint; ctx.fillText(l.text, clamp(l.x - tw / 2, 4, W - tw - 4), l.y - gh);
        ctx.globalAlpha = 1;
        continue;
      }
      // speech bubble drawn in characters, the 'v' in the bottom rule pointing at the speaker
      const inner = l.text.length + 2, bar = '-'.repeat(inner);
      const lines = ['.' + bar + '.', '| ' + l.text + ' |', "'" + bar + "'"];
      const wpx = (inner + 2) * gw, x = clamp(l.x - wpx / 2, 4, W - wpx - 4), y = clamp(l.y - gh * 3.2, 4, H - gh * 3 - 4);
      const vcol = clamp(Math.round((l.at - x) / gw), 2, inner - 1);
      lines[2] = lines[2].slice(0, vcol) + 'v' + lines[2].slice(vcol + 1);
      ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillRect(x + gw * 0.5, y + gh * 0.15, wpx - gw, gh * 2.7);
      ctx.fillStyle = C.hint;
      lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * gh));
    }
    ctx.textBaseline = 'top'; ctx.font = `${P.cellSize}px ${P.fontFamily}`;
  }

  /* ---------- render ---------- */
  function render() {
    if (!cols) return;
    chars = hillCh.slice(); col.set(hillCol); smalls = [];
    const ramp = RAMPS[P.ramp] || RAMPS.dither, rl = ramp.length, skyH = rows * 0.5;
    const th = 0.64 - P.cover * 0.18; drift = T * P.wind * 0.035;
    // sample the cloud field once per frame on a half-width grid, with 3 extra rows above for the light test
    const LIFT = 3, hc = (cols >> 1) + 2; let maxSky = 0; for (const v of skyLimit) if (v > maxSky) maxSky = v;
    if (!F || F.length !== (rows + LIFT) * hc) F = new Float32Array((rows + LIFT) * hc);
    for (let r = -LIFT; r < Math.min(rows, maxSky); r++) { const py = r * ch + ch / 2, o = (r + LIFT) * hc;
      for (let k = 0; k < hc; k++) F[o + k] = cloudField(k * 2 * cw + cw / 2, py); }
    const field = (r, c) => { const o = (r + LIFT) * hc, k = c >> 1; return c & 1 ? (F[o + k] + F[o + k + 1]) * 0.5 : F[o + k]; };
    const cf = Math.floor(T * 4); // cloud-rim flicker frame (4/s - slower reads calmer)
    for (let r = 0; r < rows; r++) {
      const gy = r / skyH, dens = 1 - smooth(0.3, P.depth * 1.35, gy);
      const prof = (1 - smooth(-0.15, 0.2, gy)) * 0.1 + smooth(0.55, 1.05, gy) * 0.22;
      for (let c = 0; c < cols; c++) {
        if (r >= skyLimit[c]) continue;
        const i = r * cols + c, b = (BAYER[(r & 3) * 4 + (c & 3)] + 0.5) / 16;
        const D = field(r, c) - th - prof;
        let cov = 0, sh = 0;
        if (D > -0.04) { cov = smooth(-0.025, 0.06, D);
          const Da = field(r - LIFT, c) - th - prof, core = smooth(0.05, 0.22, D);
          // undersides, where the cloud thickens toward the top, fall into the cloud's own shadow
          sh = cov * clamp((Da - D) * 5, 0, 1) * (0.62 - core * 0.12); }
        const open = dens * (1 - cov), lv = open * rl + (b - 0.5) * 0.9, ls = sh * rl * 1.6 + (b - 0.5) * 0.9;
        if (lv >= 0.5) { chars[i] = ramp[Math.min(rl - 1, Math.floor(lv - 0.5))]; col[i] = open > 0.62 ? 2 : 1; }
        else if (ls >= 0.5) { chars[i] = ramp[Math.min(rl - 1, Math.floor(ls - 0.5))]; col[i] = sh > 0.25 ? 4 : 3; }
        // the soft rim of a cloud (where cover is still forming) flickers: some cells drop out for a
        // frame, others render small, and the pattern walks with time so the edge looks wind-torn
        if (!reduceMotion && cov > 0.02 && cov < 0.45 && col[i]) {
          const n = hash(c * 5 + cf * 3, r * 9 + cf);
          if (n < 0.07) { chars[i] = ' '; col[i] = 0; }
          else if (n < 0.28) { smalls.push(r, c, chars[i], col[i]); chars[i] = ' '; col[i] = 0; } }
        else if (cov < 0.05 && dens < 0.12 && hash(c, r + 999) < 0.014 * Math.max(0, 1 - gy)) { chars[i] = '.'; col[i] = 1; }
      }
    }
    const put = (r, c, s, k) => { if (r < 0 || r >= rows || c < 0 || c >= cols) return; const i = r * cols + c; chars[i] = s; col[i] = k; };
    for (const f of flowers) {
      const s = Math.sin(T * 1.6 + f.phase + f.c * 0.05) * (0.4 + P.wind * 0.3);
      const lean = s > 0.45 ? 1 : s < -0.45 ? -1 : 0, shift = s > 0.95 ? 1 : s < -0.95 ? -1 : 0;
      let r = f.base;
      for (let k = 0; k < f.t.s; k++, r--) { const top = k === f.t.s - 1;
        put(r, f.c, top && lean > 0 ? '/' : top && lean < 0 ? '\\' : '|', STEM);
        if (k === 0 && f.leaf) put(r, f.c + f.leaf, f.leaf < 0 ? '\\' : '/', STEM); }
      for (let j = f.t.h.length - 1; j >= 0; j--, r--) { const line = f.t.h[j], x0 = f.c - (line.length >> 1) + shift;
        for (let q = 0; q < line.length; q++) { const g = line[q]; if (g !== ' ') put(r, x0 + q, g, CENTERS.includes(g) ? CENTER : f.petal); } }
    }
    G.labels = []; G.eyes = [];
    if (P.game) drawGame(put);
    // draw: merge same-coloured runs (spaces included) into single fillText calls
    ctx.fillStyle = C.background; ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) { const y = r * ch, o = r * cols; let c = 0;
      while (c < cols) { const k = col[o + c]; if (!k) { c++; continue; }
        let e = c + 1, end = c + 1; while (e < cols && (col[o + e] === k || col[o + e] === 0)) { if (col[o + e] === k) end = e + 1; e++; }
        ctx.fillStyle = COLORS[k]; ctx.fillText(chars.slice(o + c, o + end).join(''), c * cw, y); c = end; } }
    if (smalls.length) {
      const fs = P.cellSize * SMALL; ctx.font = `${fs}px ${P.fontFamily}`;
      const sw = ctx.measureText('M').width, sh = fs * 1.18, ox = (cw - sw) / 2, oy = (ch - sh) / 2;
      for (let k = 0; k < smalls.length; k += 4) { const r = smalls[k], c = smalls[k + 1];
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        ctx.fillStyle = COLORS[smalls[k + 3]]; ctx.fillText(smalls[k + 2], c * cw + ox, r * ch + oy); }
      ctx.font = `${P.cellSize}px ${P.fontFamily}`;
    }
    drawOverlay();
  }

  function loop(now) {
    if (destroyed) return;
    raf = requestAnimationFrame(loop);
    if (now - last < 1000 / P.maxFps) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!reduceMotion) T += dt;
    if (P.game) updateGame(dt);
    if (!reduceMotion || dirty || gameActive()) { render(); dirty = false; }
  }

  /* ---------- input: the canvas sits behind the page, so listen on window ---------- */
  const pt = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const nearBall = (p) => Math.abs(p.x - G.ball.x) < Math.max(18, cw * 2.5) && Math.abs(p.y - G.ball.y) < Math.max(18, ch * 1.6);
  const nearDog = (p) => { const d = G.dog; if (d.st === 'away') return false; const gy = groundAt(d.x) + d.jump;
    return Math.abs(p.x - d.x) < (DOGW / 2) * cw && p.y < gy && p.y > gy - DOGH * ch; };
  const canGrab = (e) => P.game && G.ball.st !== 'carried' && !(e.target instanceof Element && e.target.closest(INTERACTIVE)) && nearBall(pt(e));
  let prevSelect = '', prevCursor = '';
  // what the mouse is over - 'ball' | 'dog' | null - reported to the host on change (the cursor bubble)
  let hoverKind = null;
  const setHover = (k) => { if (k === hoverKind) return; hoverKind = k; if (P.onHover) { try { P.onHover(k); } catch {} } };
  // 'shake' (the ball shaken hard enough to call the dog) and 'pet' - the host retires its hints on these
  const action = (what) => { if (P.onAction) { try { P.onAction(what); } catch {} } };
  function onDown(e) {
    if (e.button > 0) return;
    if (P.game && !(e.target instanceof Element && e.target.closest(INTERACTIVE)) && !nearBall(pt(e)) && nearDog(pt(e))) {
      const d = G.dog; if (!d.jv) d.jv = -240; d.woof = 1; action('pet'); return; // pet the dog: it hops and barks
    }
    if (!canGrab(e)) return;
    e.preventDefault();
    const p = pt(e), b = G.ball;
    G.grab = { id: e.pointerId, ox: b.x - p.x, oy: b.y - p.y }; b.st = 'held'; setHover(null);
    G.hist = [{ x: b.x, y: b.y, t: performance.now() }]; G.shakes = []; G.lastDir = 0;
    prevSelect = document.body.style.userSelect; document.body.style.userSelect = 'none';
    prevCursor = document.documentElement.style.cursor; document.documentElement.style.cursor = 'grabbing';
  }
  function onMove(e) {
    if (!G.grab) {
      if (e.pointerType === 'mouse' && P.game) {
        const clear = !(e.target instanceof Element && e.target.closest(INTERACTIVE)), p = pt(e);
        const over = G.ball.st !== 'carried' && nearBall(p) && clear;
        const dog = !over && clear && nearDog(p);
        document.documentElement.style.cursor = over ? 'grab' : dog ? 'pointer' : prevCursor;
        setHover(over ? 'ball' : dog ? 'dog' : null);
      }
      return;
    }
    if (e.pointerId !== G.grab.id) return;
    const p = pt(e), b = G.ball;
    const nx = clamp(p.x + G.grab.ox, cw, W - cw), ny = Math.min(p.y + G.grab.oy, groundAt(nx) - ballR());
    const now = performance.now(), mdx = nx - G.hist[G.hist.length - 1].x;
    if (Math.abs(mdx) > 4) { const dir = Math.sign(mdx);
      if (G.lastDir && dir !== G.lastDir) { G.shakes.push(now); G.shakes = G.shakes.filter((t) => now - t < 1000);
        if (G.shakes.length >= 4) { G.shakes = []; summon(); action('shake'); } }
      G.lastDir = dir; }
    b.x = nx; b.y = ny; G.hist.push({ x: nx, y: ny, t: now }); if (G.hist.length > 8) G.hist.shift();
  }
  function onUp(e) {
    if (!G.grab || e.pointerId !== G.grab.id) return;
    G.grab = null; document.body.style.userSelect = prevSelect; document.documentElement.style.cursor = prevCursor;
    const b = G.ball, now = performance.now(), old = G.hist.find((h) => now - h.t < 90) || G.hist[0];
    const dt = Math.max(0.016, (now - old.t) / 1000);
    let vx = (b.x - old.x) / dt, vy = (b.y - old.y) / dt; const sp = Math.hypot(vx, vy), max = 1500;
    if (sp > max) { vx *= max / sp; vy *= max / sp; }
    b.vx = vx; b.vy = vy; b.st = 'flying';
    const d = G.dog;
    // any release is a throw to the dog - a drop right next to it included
    if (d.st === 'wait') { d.home = clamp(d.x, DOGW * cw, W - DOGW * cw); d.st = 'chase';
      // a real throw: count it (the host resolves the global total; the dog reads it out on the catch)
      G.throwsHere++; G.throws = P.onThrow ? (() => { try { return P.onThrow(); } catch { return null; } })() : null; }
  }
  // on touch screens, stop the page from scrolling when the touch starts on the ball
  function onTouchStart(e) { const t = e.touches[0]; if (t && canGrab({ clientX: t.clientX, clientY: t.clientY, target: e.target })) e.preventDefault(); }
  function onTouchMove(e) { if (G.grab) e.preventDefault(); }

  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!destroyed) resize(); });
  raf = requestAnimationFrame(loop);

  return {
    /** Change settings live, e.g. field.set({ wind: 2, cover: 0.7 }) */
    set(next = {}) {
      const rebuild = 'seed' in next || 'flowers' in next || 'hills' in next || 'bumps' in next || 'hillTexture' in next || 'cellSize' in next || 'fontFamily' in next;
      Object.assign(P, next);
      if (next.colors) { Object.assign(C, next.colors); buildPalette(); }
      if ('seed' in next) seed = next.seed | 0;
      if (rebuild) resize(); dirty = true;
    },
    /** Stop the animation and remove every listener */
    destroy() {
      destroyed = true; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchmove', onTouchMove);
      if (G.grab) { document.body.style.userSelect = prevSelect; }
      document.documentElement.style.cursor = prevCursor;
    },
  };
}
