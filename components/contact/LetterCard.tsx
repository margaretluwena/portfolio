"use client";

/*
  CONTACT — the 3D letter → mailbox (react-three-fiber, per docs/CONTACT_LETTER.md).

  State machine (unchanged from the CSS placeholder):
    idle -> folding -> flying -> closing -> sent

  idle     letter tilts toward the pointer (lerped in useFrame)
  folding  letter squashes to 35% height, tucks back; mailbox flap swings open
  flying   letter rides a raised bezier arc into the slot, shrinking + pitching
  closing  flap snaps shut with a little overshoot
  sent     copy swaps to "Sent." and the mailto delivery fires

  Quality floor: prefers-reduced-motion mounts NO canvas — a static card with a
  real Send button does the same delivery. Send is a real <button> in both paths.
  The render loop pauses when the canvas is off-screen.
*/

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html, RoundedBox } from "@react-three/drei";
import { motion, useInView, useReducedMotion } from "motion/react";
import * as THREE from "three";

type Phase = "idle" | "folding" | "flying" | "closing" | "sent";

const MAILTO = "mailto:luwena@usc.edu?subject=Hello%20Margaret";
const deliver = () => { window.location.href = MAILTO; };

/* framerate-independent exponential approach */
const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt);

const LETTER_HOME = new THREE.Vector3(0, 0.35, 0);
const ARC_MID = new THREE.Vector3(0, 1.15, 0.45);
const SLOT = new THREE.Vector3(0, -0.62, 0.05);

function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number, out: THREE.Vector3) {
  const u = 1 - t;
  return out.set(
    u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    u * u * a.y + 2 * u * t * b.y + t * t * c.y,
    u * u * a.z + 2 * u * t * b.z + t * t * c.z
  );
}
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function Scene({ phase, onSend }: { phase: Phase; onSend: () => void }) {
  const letter = useRef<THREE.Group>(null!);
  const flap = useRef<THREE.Group>(null!);
  const flyStart = useRef(0);
  const tmp = useRef(new THREE.Vector3());
  // fit the scene on narrow canvases: the letter is 2.4 units wide, a phone
  // viewport shows ~1.7 — scale everything down together (Html follows)
  const { viewport } = useThree();
  const fit = Math.min(1, viewport.width / 3.4);

  useFrame((state, dt) => {
    const L = letter.current, F = flap.current;
    if (!L || !F) return;

    if (phase === "idle") {
      L.rotation.y = damp(L.rotation.y, state.pointer.x * 0.25, 4, dt);
      L.rotation.x = damp(L.rotation.x, -state.pointer.y * 0.2, 4, dt);
      L.position.lerp(LETTER_HOME, Math.min(1, dt * 6));
      L.scale.y = damp(L.scale.y, 1, 8, dt);
      F.rotation.x = damp(F.rotation.x, 0, 8, dt);
    }

    if (phase === "folding") {
      L.scale.y = damp(L.scale.y, 0.35, 14, dt);
      L.position.z = damp(L.position.z, -0.12, 10, dt);   // slight tuck
      L.rotation.x = damp(L.rotation.x, 0, 10, dt);
      L.rotation.y = damp(L.rotation.y, 0, 10, dt);
      F.rotation.x = damp(F.rotation.x, -1.2, 9, dt);     // flap opens
      flyStart.current = state.clock.elapsedTime;          // keep fresh until flying begins
    }

    if (phase === "flying") {
      const t = Math.min(1, (state.clock.elapsedTime - flyStart.current) / 0.65);
      const e = easeInOut(t);
      L.position.copy(bezier(LETTER_HOME, ARC_MID, SLOT, e, tmp.current)); // the arc sells it
      const s = 1 - 0.8 * e;
      L.scale.set(s, Math.max(0.35 * s, 0.05), s);
      L.rotation.x = damp(L.rotation.x, -Math.PI / 2, 8, dt);              // pitch to face the slot
    }

    if (phase === "closing" || phase === "sent") {
      L.position.y = damp(L.position.y, SLOT.y - 0.25, 10, dt);            // settle inside
      L.scale.setScalar(damp(L.scale.x, 0.02, 10, dt));
      // close with overshoot: spring past 0 then settle
      const target = phase === "closing" ? 0.12 : 0;
      F.rotation.x = damp(F.rotation.x, target, phase === "closing" ? 16 : 10, dt);
    }
  });

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[-3, 5, 2]} intensity={1.1} />
      <directionalLight position={[0, 0.5, 5]} intensity={0.35} /> {/* soft front fill so the paper reads white */}

      <group scale={fit}>
      {/* LETTER */}
      <group ref={letter} position={LETTER_HOME.toArray()}>
        <RoundedBox args={[2.4, 1.5, 0.02]} radius={0.04}>
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </RoundedBox>
        {(phase === "idle") && (
          <Html transform position={[0, 0, 0.03]} distanceFactor={2.2} className="pointer-events-auto select-none">
            <div className="w-[420px] p-8" style={{ fontFamily: "var(--font-body)" }}>
              <p className="text-[17px] text-ink">Margaret Luwena is…</p>
              <div className="mt-4 space-y-2 text-[15px] text-ink/60">
                <p>a designer, engineer, and builder.</p>
                <p>Say hello: luwena@usc.edu</p>
              </div>
              <button
                onClick={onSend}
                className="mt-6 rounded-full border border-ink px-5 py-2 text-[15px] transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                Send ↗
              </button>
            </div>
          </Html>
        )}
      </group>

      {/* MAILBOX — body + flap hinged at its top edge */}
      <group position={[0, -0.85, 0]}>
        <mesh>
          <boxGeometry args={[1.7, 0.55, 0.7]} />
          <meshStandardMaterial color="#141414" roughness={0.6} />
        </mesh>
        {/* hinge group sits at the top-front edge; the flap hangs below it */}
        <group ref={flap} position={[0, 0.28, 0.35]}>
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[1.7, 0.18, 0.02]} />
            <meshStandardMaterial color="#242424" roughness={0.5} />
          </mesh>
        </group>
      </group>

      <ContactShadows position={[0, -1.21, 0]} opacity={0.35} scale={8} blur={2.4} far={2.5} />
      </group>
    </>
  );
}

export default function LetterCard() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef);

  async function send() {
    setPhase("folding");
    await wait(450);
    setPhase("flying");
    await wait(650);
    setPhase("closing");
    await wait(500);
    setPhase("sent");
    deliver();
  }

  /* Reduced motion: no canvas at all — static card, same delivery */
  if (reduce) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="relative h-[293px] w-[420px] rounded-lg border border-ink/10 bg-paper p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
          <p className="text-body-lg text-ink">Margaret Luwena is…</p>
          <div className="mt-6 space-y-3 text-body-lg text-ink/60">
            <p>a designer, engineer, and builder.</p>
            <p>Say hello: luwena@usc.edu</p>
          </div>
          {phase !== "sent" ? (
            <button
              onClick={() => { setPhase("sent"); deliver(); }}
              className="absolute bottom-6 right-6 rounded-full border border-ink px-5 py-2 text-body-lg transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              Send ↗
            </button>
          ) : (
            <p className="absolute bottom-6 right-6 wordmark text-body-lg text-ink">Sent.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative h-[70vh]">
      <Canvas
        camera={{ position: [0, 0.6, 4], fov: 40 }}
        dpr={[1, 2]}
        frameloop={inView ? "always" : "demand"}
      >
        <Scene phase={phase} onSend={send} />
      </Canvas>

      {phase === "sent" && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute inset-x-0 top-[22%] text-center wordmark text-title text-ink"
        >
          Sent.
        </motion.p>
      )}

      {/* no-JS / crawler fallback */}
      <noscript>
        <p className="text-center text-body-lg">
          <a href={MAILTO}>luwena@usc.edu</a>
        </p>
      </noscript>
    </div>
  );
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
