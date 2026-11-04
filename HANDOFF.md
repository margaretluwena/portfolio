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
| Work cards: text title (no SVG lockups on cards), a `signal` pill ("Raised $3M+", "Audience Choice winner", ...), description slides in on hover; parked cards are inert. Hover SCENES (2026-11-03, `components/works/CardHover.tsx`): Mark's three iPhone screens rise into the card fanned (CSS, group-hover); Traeco's dashboard opens as the product does (stat cards rebuilt in HTML at the capture's 3172x1960 pixel coordinates, scaled to the layer: count-ups, the budget meter, the savings figure, the "where it went" bars); Prosaic's chart bars grow up (paper curtains over the capture's bars shrinking to the top). `play` counts the hovers and replays. Reduced motion: at rest | `components/works/WorkList.tsx`, `CardHover.tsx`, `lib/works.ts` |
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

## Case-study copy: the Google Doc leads (2026-11-02)

Margaret's "Case Studies" Google Doc (Mark, Traeco, Atlix, Prosaic
Intelligence) is the canonical copy; the four studies in `lib/works.ts`
were rewritten to it on 2026-11-02 in the essay structure (Setup, stats,
The problem, decisions each with a "What I learned" line, What shipped,
Around it, Looking back). Her [MAR: ...] and [CHECK ...] notes render
highlighted on the page until she fills them. Sources mined for media:
the Mark iOS Figma file (`l917dM0JromELo33T0teG3`, Design-V3 page:
V3.2 library and share explorations, V3.3 share sketches, Demo V3.3
screens), the "Mar <> Anantika" Prosaic file (`SuAL6GR89qq2NEDyuabFyV`,
the Font choice 1 frame), the Traeco platform clone
(`~/Traeco/Agent-Optimization-Platform`: two-line SDK, "Savings available"
eyebrow, shadow evaluation in AUDIT.md), and the atlix-landing repo
(github.com/VishnuK1947/atlix-landing: the May 2026 policymaker
positioning and `public/atlixdemo.mp4`; re-encoded with the repo's
ffmpeg-static to `public/videos/atlix/demo.mp4` and `card.mp4`, on the
study and the home card).

## Three explorations, 2026-11-03

- **The intro in dither.** `components/shell/DitherWordmark.tsx` samples
  "MARGARET LUWENA" from its real face into a 14-row grid at the sky's
  6:11 cell and draws it in the sky's glyphs on a canvas over the page:
  the cells rise into place (assemble, ~1.1s), the real text crossfades
  in and holds, then on the flight to the corner the cells follow the
  moving wordmark's live rect, shedding and regathering, and settle into
  the real text on landing. `app/page.tsx` drives the phases; the hidden
  text lives on an inner span because Motion animates the shared-layout
  element's own opacity. HOLD_MS is 2500. Reduced motion skips it all.
  The cells are mapped onto the text's INK BOX, not its element: the
  inner span's rect is the inline box (advance by ascent+descent,
  transforms included) and the sampled ink offsets scale onto it, so
  the glyphs sit on the letters at any size or mid-flight (they read as
  "not lined up" before, 2026-11-03). On landing the cells FADE OUT as
  the real corner text fades in under them; they used to overlap at
  full strength for a third of a second, which read as the name going
  thick and snapping back to the regular face.
  It plays once per PAGE LOAD (a module-level flag): a reload replays
  it, returning to "/" from another page within the app skips it. It was
  a sessionStorage gate before, which meant a tab saw it exactly once
  and every reload after that skipped it (2026-11-03).
- **The dog's frames** moved to `components/sky-field/dog-frames.mjs`:
  run, sit, lie (head up, chin on paws), the spin's five views, the play
  bow. Pets take turns (hop, spin, bow); after ~9s idle the dog lies down
  and gets up when the ball moves or it is petted; 40% of returns end in
  a spin. `npm run capture:dog` redraws the contact sheet at
  `public/images/about/dog-frames.png`.
- **Play is a clothesline** (`components/play/Clothesline.tsx`, a
  window-tall FIXED scene that rides up by `--sky-lift` exactly as the
  sky does, so the poles and basket never leave the hills; `app/play/
  page.tsx` makes its main 86vh so the footer's 14vh top margin puts
  the footer band at the window's bottom edge and the first pixel of
  scroll starts the lift; the large-piece modal is the scene's sibling,
  clear of that transform): two poles
  planted on the sky's front hill (93vh), the basket on the ground at
  the RIGHT (its right end on the nav pill's right end), a welcome line
  standing on the ground at the left (its left edge on the nav pill's
  left end; both measured from the fixed <header> each resize) ("Hey,
  welcome to the playground! This is where (all) my smaller things
  are, including (graphics) and (ui/ux) that didn't make it into my
  main works :)") whose bracketed words are the filter pills, and the
  line strung between the poles above. The play collections' titles
  are the pill labels, lowercased: "Graphics" and "UI/UX" (renamed from
  "Small Works", 2026-11-03). The pieces
  start in the basket; the filter (All plus each play collection's
  title) lifts the matching ones onto the rope, pegged under its sag,
  in as many rows as fit (128px tall on desktop, 92 on phones, so seven
  or so share a line at 1440; they shrink, down to 72 / 56, until every
  row fits the band, so the band's fade only ever shows past that
  floor). The rows run down the band, each rope
  28px under the hem of the row above, clear of it (an overlapped,
  in-depth stacking was tried and dropped, 2026-11-03). Each hung piece
  is a PENDULUM on its peg: one rAF loop integrates a damped swing per
  piece, linked to its neighbours on the row (`LINK`) so a push spreads
  along the rope, pushed by the pointer's sideways motion as it passes
  (`PUSH`, capped, so brushing back and forth pumps it to ~20 degrees
  and neighbours to ~9), and leaned on by a gust (`GUST`, a bell of
  force sweeping the line at 900px/s) every six to fifteen seconds for
  a few degrees of sway; angles go to one motion value per piece, no
  re-renders. Reduced motion: static. Click opens a piece large. Groups come from the play works in `lib/works.ts`. The ground
  never moves: when the rows outgrow the window the LINE scrolls
  (wheel, trackpad, touch; a spring-eased MotionValue on the line group)
  inside a band that fades at its ends and stops with the last row just
  above the basket's handle, so no scroll puts a piece into the basket
  (Margaret, 2026-11-03); past the line's end the wheel falls through to
  the page for the footer, which carries the scene and the hills up
  together. A piece lives in the line group (hung) or the scene
  (folded); the move between them is a shared-layout flight on its
  `layoutId`. Everything structural is drawn in the sky's glyphs (9px
  Plex Mono on 11px rows) on three canvases: the scene's (a `||` pole
  with a `=` cap and `====` feet at either end, the basket's `=` handle
  and dotted inside), the line's, which scrolls with the rows (ropes
  pole to pole stepping - to _, an `o` knot on paper where each ties on,
  a peg `n` over `|` at each hang point; each row's rope has an EXTENT
  motion value, strung across from the left pole over 0.8s as the row
  appears and pulled back over 0.6s as it goes, pegs and the right knot
  arriving as the rope reaches them), and the front's over the
  folded pieces (a white fill so they read as inside, a staggered `-|`
  wicker, `|` sides, the `(====)` rim; 320 by 106, nine rows of wicker).
  The folded pieces lie across the basket's width in a shuffled order,
  each tilted and peeking over the rim by its own amount, clamped
  inside its edges. The basket narrows to fit between the poles on a
  phone.

## Content still marked NEED (Margaret's to supply)

- Prosaic Intelligence: open, featured on the home column after Atlix in
  Impeccable Chicken's old slot (2026-11-02); Impeccable Chicken stays on
  the All Works page, parked. Founder Anantika Mannby (credited). She has
  cleared the product numbers, so the charts may be shown, and the live
  site prosaicintelligence.ai may be linked (it differs from Margaret's
  build, which is what the footage shows). Footage and stills come from
  her clone at ~/Traeco/prosaic-intelligence run on port 3200
  (.claude/launch.json "prosaic-site") via `npm run capture:prosaic`. The
  card is a layered still: the chart card over the Sycophancy risk card.
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
