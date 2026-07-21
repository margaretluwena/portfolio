# Hand-off — start here

Everything's scaffolded. To build it out in Claude Code, do three quick things, then paste the prompt.

## 1. Put the files in a branch (keeps your live site untouched)
```bash
# in your portfolio repo
git checkout -b redesign
# copy the contents of this scaffold into the repo root, then:
git add -A && git commit -m "portfolio rebuild scaffold"
```
Only merging `redesign` → your production branch ever changes margaretluwena.net.
Everything before that lives on a Vercel **preview URL**.

## 2. Add the one missing asset
Drop `Nohemi-Regular.woff2` into `public/fonts/` (export it from your Figma file).

## 3. Open Claude Code in the repo and paste this prompt

> Read `BRIEF.md` and `docs/CONTACT_LETTER.md` first — they're the plan and this repo is the
> scaffold. Work only on the `redesign` branch; never push to the production branch or run a
> production deploy — going live is my call via merge.
>
> Then:
> 1. `npm install`, confirm `npm run dev` runs, and fix any build/type errors in the scaffold.
> 2. Get the four signature moments feeling right, one at a time, matching my Figma
>    (`Portfolio` file — use the Figma MCP to pull nodes/assets): (a) intro wordmark flying to
>    the corner, (b) the interactive hero texture, (c) works image flying to center via the
>    intercepting-route overlay, (d) the 3D letter → mailbox per the spec doc.
> 3. Finish the works overlay: wrap the `@modal` slot in `AnimatePresence` so it animates out on
>    close, and verify the shared-layout morph actually plays (image flies, doesn't pop).
> 4. Replace all placeholder/"lalalal" copy with real content, and wire up About, Play, Resume,
>    and the works index so every nav link resolves.
> 5. Keep the quality floor throughout: responsive to mobile, visible keyboard focus,
>    `prefers-reduced-motion` respected.
>
> Go moment by moment and show me each before moving on. Don't touch my live site.

That's it. Build on the preview, and when you love it, merge to go live.

---

## What's in here
```
BRIEF.md                     the plan (stack, tokens, the four moments, deploy-safe workflow)
docs/CONTACT_LETTER.md       react-three-fiber build spec for the 3D letter → mailbox
app/page.tsx                 intro → main, wordmark flies to corner
app/works/page.tsx           works index (all projects)
app/works/[slug]/page.tsx    standalone case study (direct-link destination)
app/@modal/(.)works/[slug]/  intercepting overlay — the fly-to-center transition
app/about|play|resume/       the rest of the nav, scaffolded so no link is dead
components/                   hero texture, nav, shell, work list, case study, letter card
lib/works.ts                 works data + case-study content (slugs match your live site)
app/globals.css + tailwind   all design tokens, pulled from Figma
```
Tokens and data are production-ready; the components are reference implementations to run and refine.
