# Hand-off - start here

Paste "read HANDOFF.md" into a fresh Claude Code session to pick up where
the 2026-10-21 session left off. Everything below is live on
margaretluwena.net; the working tree is clean.

## The repo in one paragraph

Next.js 15 / React 19 portfolio for Margaret Luwena. Branch `redesign` is
the working branch; `main` is kept fast-forwarded to it. Git remote:
github.com/margaretluwena/portfolio. Vercel builds `main` on push as
PRODUCTION and other branches as login-protected previews, so **pushing
`main` IS deploying - only on Margaret's say-so**. Commits must be authored
as luwena@usc.edu (set per-repo) or Vercel silently skips the build. The
release ritual used all session: commit on `redesign`, `git checkout main
&& git merge --ff-only redesign`, back to `redesign`, `git push origin
main redesign`, then poll the Vercel deployments API for READY on that
sha. Upstash Redis ("sky-throws", free plan) is attached for the player
counter. Design source of truth is the Figma file `zsUcjQVncy8OinX0VJl8EB`
("Portfolio Revamp" page). Dev server: `npm run dev -- --port 3001`
(`.claude/launch.json` has it as `portfolio-redesign`); a copy is usually
already running on 3001 from Margaret's terminal - attach, don't start a
second. Typecheck with `npx tsc --noEmit`; ESLint is not installed. `npm
run build` also runs `scripts/check-dashes.mjs` - **no em dashes anywhere
in copy or code comments**, the build fails on them.

## Where things live

| Area | Files |
| --- | --- |
| Home: intro wordmark flight, then bio column (fixed) + works column (its own scroller, auto-cycles one card every 4s until touched, ends where the last card meets the first's line, "See more work" under it). No footer on home. | `app/page.tsx`, `components/shell/PortfolioShell.tsx`, `components/works/WorksColumn.tsx` |
| Nav pill: dots for the works index on home; on a case study it lifts fully out past 160px of scroll and returns above; pinned everywhere else | `components/nav/Nav.tsx`, `NavContext.tsx` |
| Page transitions: fade out, scroll to top, route; a 700ms safety net fires the route if the exit never reports back | `components/providers/PageTransition.tsx` |
| Cursor bubble: a white pill off the pointer. `data-bubble="..."` on any element, or `setCursorBubble()` for the canvas. "Coming soon!" on parked cards; "Try shaking!" / "Pet me" on the ball and dog, each shown until done once per visit | `components/providers/CursorBubble.tsx`, `SkyFrame.tsx` |
| Work cards: text title (no SVG lockups on cards), a `signal` pill ("Raised $3M+", "Audience Choice winner", ...), description slides in on hover; parked cards are inert | `components/works/WorkList.tsx`, `lib/works.ts` |
| Case-study template: 56.4vw column; hero rises in (no card morph, no overlay route); blocks context / brief / problem / solution (pieces may carry a `gallery` row) / artifactGrid / lessons; landscape images fill the column flush left, tall ones sit beside their text flush right; Previous / Next walk the open studies; no footer | `components/works/CaseStudyContent.tsx`, `Blocks.tsx`, `app/works/[slug]/page.tsx` |
| ASCII minimap (studies, md+): left gutter; track of 9px cells, sections fanned evenly down it, lens paced by section length on a spring, nearly flat between headers and swelling five wide on one, dithered ends; names beside it at the rail's spacing, active one slides right and turns ink; Return above; up-arrow pill below; native scrollbar hidden on studies | `components/works/AsciiScrollbar.tsx`, `Blocks.tsx` (SectionRail = Return only + phone Return pill), `app/globals.css` (`html.study-scroll`) |
| Study type scale: body 16-22px, labels 15-22px medium in the project accent, headline 22-36px | `app/globals.css` (`.study-*`) |
| Works data: slugs, credits, `signal`, blocks, cover art geometry (`rotate` / `crop`), `hero`, `accent`; `comingSoon` parks a work (redirects home, card inert) | `lib/works.ts` |
| Image pixel sizes for true-aspect rendering | `lib/image-sizes.json` - regenerate with `npm run images` after adding images (macOS `sips`) |
| Sky Field: Margaret's ASCII sky + fetch game. Added: pointer rain (over real cloud only, ~25deg to the left, sprouts flowers on all three hills where it lands), `onHover` / `onAction` hooks, speech bubble in characters beside the mouth on the side the dog faces, "throw the ball please!" after ~5s with no throw, the dog returns the ball to the LEFT (`ballX`), announces the running player total | `components/sky-field/sky-field.js` (engine), `SkyFrame.tsx` (dials, bubble lines, visit-scoped hints), `SkyFieldBackground.tsx` |
| Player counter API: one count per browser's first throw, total read on every catch | `app/api/throws/route.ts` (KV REST when `KV_REST_API_URL` / `KV_REST_API_TOKEN` exist) |
| About: blue card (tilt halved), mail left / socials right, pinned Work Experiences (22vh, top + bottom fades), involvement stickers + polaroid fan (two-up below lg) | `components/about/AboutCard.tsx`, `AboutExperience.tsx`, `AboutInvolvement.tsx` |
| Footer: static, bottom of About / Works / Play only; one colophon line | `components/shell/SiteFooter.tsx`, `FooterSwitch.tsx` |
| Socials: LinkedIn, X, mail (Instagram dropped) | `socials` + `EMAIL` in `PortfolioShell.tsx` |
| OG card: the home page at card size (sky, pill, name, tagline, bio, two art-only cards, hills, ball, dog); Manrope fetched from Google Fonts at render | `app/opengraph-image.tsx` |
| `/llms.txt` generated from the works data; sitemap and robots exclude parked works | `app/llms.txt/route.ts`, `app/sitemap.ts`, `app/robots.ts` |

## Conventions that bit us

- Storage access must be guarded (`try { localStorage... } catch {}`): a
  browser that blocks storage threw inside React and killed the home page.
- Figma exports of child/rotated nodes come flattened on the page's white;
  use `rawImages` from `download_assets` and apply rotation/crop in CSS.
- `next.config.js` is the only config (siblings deleted); it stamps
  `NEXT_PUBLIC_BUILD_DATE` for the footer.
- Videos: no ffmpeg on this Mac; AVFoundation Swift scripts were used.
  macOS safe-save leftovers (`*.sb-*`) are gitignored.
- The Claude desktop browser pane throttles rAF and reports the tab hidden,
  so motion can't be judged there. The gstack headless browser
  (`~/.claude/skills/gstack/browse/dist/browse`) renders properly; the
  dog's lines are 3s windows, so screenshot in bursts.
- The sky engine exposes nothing to `window`; for state tracing a TEMP line
  `window.__skyG = G` was added and removed each time. Never ship it.
- Mark's packaging story is three pieces (first board with blue dots and
  pink stars, the narrowed board cropped to the board, the last round in
  yellow) plus Merch; the share piece carries a `gallery` of the three
  share styles. Don't put those images back in the artifact grid.

## Content still marked NEED (Margaret's to supply)

- Prosaic Intelligence: the study is drafted and the images are in, but the
  card is `comingSoon` until she opens it. Role / timeline / disciplines
  are inferred. Never link her test site.
- AANC and FoundHer House: removed from the data for now; she fills them
  in later.
- Traeco: outreach-tracker media, brand sheet, deck spreads. Signal pill
  wants a real number.
- Mark: context / problem media, "Make your mark" artifact.
- Visitor counter in the footer (same Upstash store).
- Josephine's infinity scroller for Play: her call.

## Parked ideas (Margaret's, not started)

- Sky field easter egg: throw the ball off the edge, the dog chases it out
  of frame and comes back carrying a different item.

## Shub's feedback tracker

`docs/feedback-shub-2026-10-13.md` - everything is DONE or HERS except
the tile-grid home layout (she chose the column) and the lockup
consistency note (resolved by text titles on cards).
