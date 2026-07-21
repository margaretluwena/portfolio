# Portfolio Rebuild — Build Brief

The starting point for rebuilding **margaretluwena.net**. Drop this whole folder into your repo
(or a fresh one), then open Claude Code with `BRIEF.md` as context. It reads this file, sees the
scaffold, and extends it instead of inventing structure from scratch.

Everything here is grounded in two real sources: the **live site** (current stack, routes, slugs)
and your **Figma** file `Portfolio Revamp` (tokens, layout, the four screens). Nothing is guessed.

---

## Stack — keep what you have

The live site is already **Next.js (App Router) on Vercel**, with case studies at `/works/[slug]`.
The rebuild stays there so the domain, deploy pipeline, routing, and SEO carry over untouched.

Added for the motion the new design needs:

| Concern | Library | Why |
|---|---|---|
| Layout / page / scroll animation | **`motion`** (Framer Motion v11) | `layoutId` shared-layout is exactly the "name flies to corner" and "work flies to center" mechanic — no manual measuring |
| Smooth scroll | **`lenis`** | The fixed-left / scroll-right feel wants inertial scroll |
| Interactive hero texture + 3D letter | **`three` + `@react-three/fiber` + `@react-three/drei`** | The signature graphic is a shader; the contact letter wants real depth |

Everything's already in `package.json`. `npm install && npm run dev`.

## Preserve (don't regenerate)

- **Domain + Vercel project** — redeploy over it, don't spin up a new one.
- **Work slugs** (already in `lib/works.ts`): `mark`, `traeco`, `atlix`, `glance`, `mountaindew`,
  `charitablefoundation`, `smallworks`, `graphics`. Existing inbound links keep working.
- **Contact**: `luwena@usc.edu`.

---

## Design tokens (from Figma, node 96:6)

Single source of truth is `app/globals.css` → surfaced through `tailwind.config.ts`.

- **Display type:** Nohemi Regular, tracking `-0.05em` (–1.25px @ 25px). *Not on Google Fonts* —
  drop `Nohemi-Regular.woff2` into `public/fonts/` (wired in `app/layout.tsx`).
- **Body/UI type:** Inter (Regular + Italic).
- **Accent:** `#a728ab` — used once, on *"is a design engineer."* Keep it rare; that's the whole point.
- **Ink:** `#000` with 70% (nav) and 50% (secondary/CONTACT) tints.
- **Placeholder:** `#d9d9d9` work images. **Paper:** `#fff`.
- **Layout ratios** (Figma canvas 1728): outer margin 5.32vw · content inset 9.32vw ·
  column split 50% · nav band 30px between hairlines. All are CSS vars, all responsive via `clamp()`.

Use `text-accent`, `font-display`, `text-corner`, `text-hero`, `px-[var(--inset-left)]`, etc.

---

## What's already scaffolded

```
app/
  layout.tsx          fonts (Inter + local Nohemi) wired to token vars
  globals.css         all design tokens + reduced-motion + .wordmark
  page.tsx            THE STAGE — intro → main, wordmark shared-layout journey
  works/[slug]/page.tsx  case study: image flies to center, text flanks
components/
  hero/InteractiveTexture.tsx   mouse-reactive shader (the signature graphic)
  shell/PortfolioShell.tsx      fixed-left / scroll-right main page
  nav/Nav.tsx                   ABOUT+WORKS+PLAY+RESUME · scribble mark · label
  works/WorkList.tsx            scrolling selected-works column
  contact/LetterCard.tsx        3D tilt card + mailbox send sequence
lib/works.ts          works data, slugs matched to live site
tailwind.config.ts    tokens → theme
```

It's a **starting point, not a tested build** — treat the components as reference implementations to
run, feel, and refine in Claude Code. The token files and data are production-ready as-is.

---

## The four signature moments

Each is the reason this portfolio isn't a template. Build them one at a time, get the *feel* right
before moving on. For each: what happens · how it's wired · gotchas · a prompt you can paste.

### 1 — Opening: name flies to the corner
**What:** Full-screen flowing texture + `MARGARET LUWENA` centered (Figma 96:4). After ~1.9s the
texture recedes to a top band and the wordmark travels to its left-panel corner (96:6). Click skips it.
**Wired:** `app/page.tsx`. One `<motion.h1 layoutId="wordmark">` exists in the intro; when phase flips,
the *same* `layoutId` renders in `PortfolioShell`'s corner — Framer tweens position + size between them.
**Gotchas:** shared-layout scales text mid-flight (settles crisp); tune `layout` duration/ease together
with the texture-collapse so they move as one gesture. Honor `prefers-reduced-motion` (already skips).
**Prompt:** *"Polish the intro in app/page.tsx: make the texture collapse and the wordmark travel feel
like one motion, add a 1-frame hold before it starts, and make the corner landing spot exactly match
the left panel's baseline."*

### 2 — Interactive hero texture
**What:** The flowing gradient at the top reacts to the cursor — warps toward it, soft highlight follows.
**Wired:** `components/hero/InteractiveTexture.tsx` — a fragment shader whose palette is sampled from
your Figma texture (pale yellow-green → sage → soft blue → white), fading to white at the bottom like
the Figma overlay. Same component is the full-screen intro and the 42vh band.
**Gotchas:** cap `dpr={[1,2]}`; pause the `useFrame` loop when off-screen for battery; reduced-motion
should fall back to a static gradient. **Option B** (in the file) swaps the noise for your actual PNG
with a liquid displacement if you'd rather use the real texture.
**Prompt:** *"In InteractiveTexture, add a static-gradient fallback under prefers-reduced-motion and
pause the render loop when the canvas isn't in the viewport."*

### 3 — Works: image flies to center
**What:** Click a work in the right column → its image animates to the center of the case-study page,
narrative text flanks left and right (Figma 97:17 / screenshot 3). Finished studies compile at the bottom.
**Wired:** `WorkList.tsx` and `works/[slug]/page.tsx` share `layoutId={`work-${slug}`}` on the image, so
Framer animates it across the route change. The compiled recap is a stubbed section at the bottom.
**Gotchas:** cross-route shared layout needs both mounts within the animation window — keep the transition
snappy and preload the target route on hover. Design the "compiled" recap as a stacked scroll section.
**Prompt:** *"Build the case-study template in works/[slug]/page.tsx: real two-column narrative, and a
'compiled' recap section that stacks the study's sections at the bottom as you scroll."*

### 4 — Contact: the 3D letter → mailbox
**What:** A letter you nudge with the cursor (tilts, parallax). Press **Send** → it folds, flies into a
mailbox, the box closes, copy becomes **"Sent."** (Figma 104:50 / screenshot 4).
**Wired:** `components/contact/LetterCard.tsx` — working CSS-3D tilt + a `idle→folding→flying→closing→sent`
state machine. Promote to react-three-fiber (drei `<RoundedBox>` + a paper material) for real depth;
the state machine stays identical.
**Gotchas:** actually deliver the message — wire Send to `mailto:`, Formspree, or Resend. Keep a
no-JS/reduced-motion path that's just the email link.
**Prompt:** *"Promote LetterCard to react-three-fiber with a real paper card and mailbox, keep the
send state machine, and wire Send to a Resend endpoint with a plain mailto fallback."*

---

## Build order

1. **Foundation** — `npm install`, add `Nohemi-Regular.woff2`, confirm tokens render (fonts, accent, layout).
2. **Main page** (#1 + fixed/scroll shell) — the spine everything hangs off.
3. **Interactive texture** (#2) — get the signature feel locked.
4. **Works** (#3) — case-study template + the fly-to-center transition, then port real content per slug.
5. **Contact** (#4) — the letter, last, as the delightful closer.
6. **Pages** — ABOUT / PLAY / RESUME, mobile passes, Lenis smooth-scroll, deploy over the Vercel project.

## Driving Claude Code well

- One signature moment per session. Land the feel before starting the next.
- Point it at the exact file + Figma node ("match `works/[slug]/page.tsx` to Figma 97:17").
- You have Figma MCP connected — let it re-pull assets/tokens directly rather than eyeballing.
- After each interaction, check the quality floor: keyboard focus, `prefers-reduced-motion`, mobile.
- Replace placeholder copy (the Figma "lalalal" filler) early — filler makes a design feel unfinished.

---

## Deploy safely — don't touch the live site until you're ready

The whole rebuild happens on a **branch with its own preview URL**. The live domain only
changes when you deliberately merge to your production branch.

- **Branch first.** `git checkout -b redesign`. Build the entire thing here.
- **Preview, not prod.** Vercel gives every non-production branch its own live preview URL on
  each push. Iterate there — it's the real site, real deploy, but *not* margaretluwena.net.
- **Production is one branch** (usually `main`). Nothing you do on `redesign` reaches the domain
  until you open a PR and merge. That merge is the "push it live" moment, and it's yours to make.
- **Claude Code only edits local files.** It doesn't deploy. Deploys happen when *you* push, and
  Claude Code asks before running git commands — it won't silently push to main.
- **Extra-cautious option:** build in a separate throwaway repo deployed as a *new* Vercel project,
  and only point the domain at it when you're happy. More isolated, but you re-wire the domain at
  the end instead of a one-click merge.

Recommended: the branch approach — same Vercel project, so going live is a single merge, and prod
stays frozen the entire time you're building.

> Note for Claude Code: never push to the production branch or run a production deploy. Work on
> `redesign`, commit there, and leave going-live to the user.

## Deeper specs in this repo
- `docs/CONTACT_LETTER.md` — full react-three-fiber build spec for the 3D letter → mailbox.
- The case-study template (`app/works/[slug]/page.tsx`) is built out with flanked columns + a
  scroll-revealed "compiled recap"; see the fly-to-center caveat in its header comment.
