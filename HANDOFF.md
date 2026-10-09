# Hand-off - start here

Paste this into a fresh Claude Code session (or just say "read HANDOFF.md")
to pick up where the 2026-10-08 session left off.

## The repo in one paragraph

Next.js 15 / React 19 portfolio for Margaret Luwena, branch `redesign`
(production = margaretluwena.net; **going live is Margaret's call via
merge, never push or deploy production**). Design source of truth is the
Figma file `zsUcjQVncy8OinX0VJl8EB` ("Portfolio Revamp" page). Dev server:
`npm run dev -- --port 3001` (`.claude/launch.json` has it as
`portfolio-redesign`). Typecheck with `npx tsc --noEmit`; ESLint is not
installed. `npm run build` also runs `scripts/check-dashes.mjs` - **no em
dashes anywhere in copy or code comments**, the build fails on them.

## Where things live

| Area | Files |
| --- | --- |
| Home page + intro wordmark flight | `app/page.tsx`, `components/shell/PortfolioShell.tsx` |
| Nav pill (persistent, animates between home/subpage layouts, hides on scroll only in case studies, veil under it) | `components/nav/Nav.tsx`, `NavContext.tsx`, `components/providers/PageTransition.tsx` |
| Rotating tagline (plain ink, 7 lines) | `components/shell/RotatingTitle.tsx` |
| Bio stickers (USC / Traeco / TroyLabs, pop on hover and stay) | `components/shell/StickerWord.tsx` |
| Work cards (home column + /works 3-col grid share `WorkCard` and `CoverArt`) | `components/works/WorkList.tsx`, `WorksColumn.tsx`, `app/works/page.tsx` |
| Case-study template (56.4vw column, hero, lede headline + lockup, 4 credits, blue/accent labels, left rail with Return) | `components/works/CaseStudyContent.tsx`, `Blocks.tsx`, `app/works/[slug]/page.tsx`, `app/@modal/(.)works/[slug]/page.tsx` |
| Works data (slugs, credits, blocks, cover art geometry incl. `rotate`/`crop`, `hero`, `accent`) | `lib/works.ts` |
| Image pixel sizes for true-aspect rendering | `lib/image-sizes.json` - regenerate with `npm run images` after adding images (macOS `sips`) |
| Sky Field background (Margaret's ASCII sky + fetch game) | `components/sky-field/sky-field.js` (her engine, with added options: `hills`, `bumps`, `hillTexture`, `ballX`, `onThrow`, `onCount`), `SkyFrame.tsx` (route-aware opacity + all the dials), `SkyFieldBackground.tsx` |
| Player counter API (one number per visitor's first throw) | `app/api/throws/route.ts` - uses Upstash/KV REST when `KV_REST_API_URL`/`KV_REST_API_TOKEN` exist, else an in-memory counter |
| About page: blue card + contact icons, pinned Work Experiences, sticker-driven photo fan | `components/about/AboutCard.tsx`, `AboutExperience.tsx`, `AboutInvolvement.tsx`, `app/about/page.tsx` |
| Footer (reveal mode on home sized under the bio; static at the bottom of every other page) | `components/shell/SiteFooter.tsx`, `FooterSwitch.tsx` |
| Social icon list (shared by bio, footer, About) | `socials` export in `PortfolioShell.tsx` - the `ink` ratio equalises visible glyph size |

## Conventions that bit us

- Figma exports of child/rotated nodes come **flattened on the page's
  white**; use `rawImages` from `download_assets` and apply rotation/crop
  in CSS (`CoverLayer.rotate` / `.crop`).
- `next.config.js` is the config Next loads (the `.mjs`/`.ts` siblings are
  dead); it stamps `NEXT_PUBLIC_BUILD_DATE` for the footer.
- Videos: no ffmpeg on this Mac; `scratchpad` Swift scripts (AVFoundation)
  were used to trim/encode `public/videos/*.mp4` at 1280 wide, 1.6 Mbps.
- The Claude desktop browser pane throttles rAF to ~1fps and reports the
  tab hidden, so Motion animations and native scroll events can't be
  judged there; verify state via JS, judge feel in a real browser.

## Content still marked NEED (Margaret's to supply)

- `AANC` work: lede, category, year, cover. `Prosaic Intelligence`: everything but the lede.
- Traeco: problem media (outreach tracker), brand system sheet, deck spreads.
- Mark: context/problem media, "Make your mark" artifact.
- Visitor counter in the footer (needs the same Upstash store as the player counter).

## Open decisions (asked, not yet answered)

1. Subpage pill: name on the LEFT (built to the Figma frames) vs. right (what Margaret first wrote).
2. Attach Upstash Redis in Vercel so the dog's player number is global (currently resets per deploy).
3. Committed on `redesign` 2026-10-08 (not merged - going live is Margaret's call).

## Commit message suggestion (when she's ready)

"Redesign pass 2026-10-08: nav pill, sky field, case-study template, About
rebuild, footer, works grid, Mark/Traeco assets"
