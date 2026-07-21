# Contact — the 3D letter → mailbox (react-three-fiber build spec)

Target: promote `components/contact/LetterCard.tsx` from the CSS-3D placeholder to a
real react-three-fiber scene, keeping the same `idle → folding → flying → closing → sent`
state machine so the wiring doesn't change.

## Scene
- `<Canvas camera={{ position: [0, 0.6, 4], fov: 40 }}>`, `dpr={[1, 2]}`.
- Lighting: one `ambientLight` (~0.6) + one `directionalLight` from top-left for a soft
  paper shadow. Add `<ContactShadows>` (drei) under both objects.
- Two objects, both drei `<RoundedBox radius={0.04}>`:
  - **Letter**: ~2.4 × 1.5 × 0.02, paper-white `meshStandardMaterial` (roughness 0.9).
    Front face carries the copy — render it as an `<Html>` (drei) overlay pinned to the
    face, OR bake it to a `CanvasTexture` for true in-scene text.
  - **Mailbox**: a simple slot — a box body + a hinged flap (separate mesh, pivoted at its
    top edge via a parent group so rotation opens/closes it). Sit it lower-center.

## Idle interaction (mouse)
- Tilt the letter toward the pointer: map `state.pointer` → target `rotation.y` (±0.25) and
  `rotation.x` (∓0.2), `useFrame` lerp toward target (factor ≈ delta*4). Same easing feel as
  the placeholder, just on a real mesh.
- Optional parallax: nudge the `<Html>` copy a few px opposite the tilt for depth.

## Send sequence (drive with the existing state machine + drei/maath `easing.damp`)
| Phase | Letter | Mailbox | Timing |
|---|---|---|---|
| folding | scale.y → 0.35 (fold in half), slight z tuck | flap opens (rotation.x → -1.2) | 450ms |
| flying  | position → mailbox slot along an arc (lift y, then drop in); scale → 0.2; rotate to face slot | stays open | 650ms |
| closing | hidden inside | flap closes (rotation.x → 0) with a small overshoot | 500ms |
| sent    | — | tiny settle bounce | copy swaps to "Sent." |

- Use a bezier/arc for the flight (lerp position through a raised midpoint) so it doesn't
  travel in a straight line — that arc is what sells it.
- After `sent`, actually deliver: POST to a Resend route handler (`app/api/contact/route.ts`)
  or Formspree. Keep a plain `mailto:luwena@usc.edu` as the no-JS fallback.

## Quality floor
- `prefers-reduced-motion`: skip the 3D entirely — render the letter as a static card with a
  normal Send button that does the delivery and shows "Sent." No canvas mounted.
- Keyboard: Send must be a real focusable `<button>`; the whole flow works without a pointer.
- Pause `useFrame` when the canvas is offscreen.

## Paste prompt for Claude Code
"Rebuild components/contact/LetterCard.tsx as a react-three-fiber scene per
docs/CONTACT_LETTER.md: drei RoundedBox letter + hinged mailbox, mouse tilt, and the
send sequence arc. Keep the existing idle→folding→flying→closing→sent state machine, wire
Send to a Resend route handler with a mailto fallback, and add the reduced-motion static path."
