# About — blue bio card + envelope send + photo marquee

Supersedes `docs/CONTACT_LETTER.md` (the r3f letter → mailbox spec; that build
is parked in `components/contact/LetterCard.tsx`, unimported). This doc
describes what actually ships at `/about`: `components/about/AboutCard.tsx`.

Source of truth: Figma file `zsUcjQVncy8OinX0VJl8EB`, page "Portfolio Revamp",
frame "About page" (163:765). Card rect 163:814 (`#0f28e0`, radius 5, paper
texture fill at color-burn), bio text 163:816 (Manrope 15px white, verbatim,
straight apostrophes normalized to curly per site rule), watermark Vector 19
(165:822) low-right behind the copy, marquee frame 165:829 (six photos,
exported at 2x to `public/images/about/`).

## Structure

Stage (`perspective: 1500px`, overflow-hidden) → launch wrapper → five
siblings sharing one stacking context:

    z1  flap        open: rotateX(180deg), origin top center, behind everything
    z2  envelope back panel   #f2ece0, 320x210
    z3  the card    tilt target, w-min(749px, 86vw)
    z4  front pocket #e6ddca, clip-path V-notch (0 34%, 50% 68%, 100% 34% …)
    z5  flap        z-index bumps to 5 the moment sealing starts

The trigger pill sits outside the wrapper, right-aligned to the card edge
(mock position), and stays put through the flight.

## Phase machine

One `phase` value drives every style; timeouts in a ref, cleared on unmount;
durations in the `T` object at the top of the file.

    idle → envelopeIn(620) → cardIn(680) → seal(420) → windup(180)
         → launch(820) → gone(instant) → [empty 620] → return(760) → idle

- Copy + label morph fire at t=0. The checkmark completes ~540ms in, the card
  moves at 620ms — envelope-in doubles as the legibility hold, no added delay.
- Windup dips the whole wrapper 14px; launch is `translateY(-150vh)
  rotate(-7deg)` on `cubic-bezier(.5,0,1,.42)` (ease-in: a throw, not a slide).
- `gone` teleports the card below the stage with every transition disabled
  (`!transition-none` on wrapper + children); the 620ms empty beat guarantees
  the frame commits before `return` animates it back up.
- Label reverts at 3.2s (mid-return); button stays disabled until the card
  lands (~4.1s).
- Envelope rest offset is measured per run: cardHeight/2 + 16px + 105px. The
  spec's fixed "126px below card center" assumed a ~300px card; the real bio
  card is ~2x that, so the offset derives from the measured rect instead.

## Tilt

motion v12 springs (stiffness 130 / damping 13 ≈ 680ms settle with slight
overshoot) on rotateX ±11 / rotateY ±14, X inverted toward the cursor.
CSS transitions were rejected: they restart toward each new mousemove target
and read as stepping. Sheen = radial-gradient overlay tracking the cursor via
motion template, 260ms opacity fade. Hover lifts `translateZ(18px)` and
deepens the shadow. Tilt requires `(hover: hover) and (pointer: fine)` and
`phase === idle`.

## Delivery

`navigator.clipboard.writeText("luwena@usc.edu")` with hidden-textarea
`execCommand` fallback (carried from eed01d6). Two-face button: invisible
widest face reserves the pill size, faces slide ±118%, checkmark draws via
stroke-dashoffset (420ms, 120ms delay), `aria-live` wrapper announces.

## Reduced motion

No envelope, no tilt: static card, same copy delivery, same button morph with
3.2s revert, plus a persistent `luwena@usc.edu · copied` line under the button
after the first copy (the path's terminal state). Marquee renders with
`animation-play-state: paused`.

## Marquee

Full-bleed strip outside the inset column. Array rendered twice (dupe set
`aria-hidden`), track animates `translateX(0 → -50%)` 46s linear infinite
(`@keyframes about-marquee` in globals.css), edge fade via mask-image (+
`-webkit-` prefix), 212x136 tiles, 18px gap, `bg-placeholder` tile when a src
is missing. Swap/add images in the `MARQUEE` array.

## Known deltas from the mock (flagged, awaiting Margaret)

- Button label ships as spec'd "Send me a message"; the mock text node reads
  "Send me a message!" (with bang) and styles it as plain text, not a pill.
- Mock marquee is inset with ~45px gaps and variable tile widths; ships as
  her written spec: full-bleed, uniform 212x136, 18px gap.
