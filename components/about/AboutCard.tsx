"use client";

/*
  ABOUT - blue bio card + envelope send + photo marquee.
  Source of truth: Figma "About page" 163:765 (page "Portfolio Revamp").
  Supersedes the r3f letter (components/contact/LetterCard.tsx, parked).
  Spec doc: docs/ABOUT_CARD.md.

  One `phase` variable drives every derived style; timeouts live in a ref
  and clear on unmount. Tilt = motion springs (a CSS transition restarts
  toward each new cursor target and reads as stepping; a spring damps a
  moving target and gives the slight overshoot for free). Everything else
  is hand-rolled CSS transitions off the phase state.
*/

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

const EMAIL = "luwena@usc.edu";

/* every duration in one place (ms) */
const T = {
  envelopeIn: 620, // envelope rises; doubles as the copied-state legibility hold
  cardIn: 680,     // card descends into the pocket
  seal: 420,       // flap flips closed (z-bump the moment this starts)
  windup: 180,     // anticipation dip - not optional, sells the throw
  launch: 820,     // ease-in fling off the top
  emptyBeat: 620,  // stage empty; also covers the one-frame teleport rule
  cardReturn: 760, // card rises back to center
  buttonRevert: 3200,
  sheenFade: 260,
  checkDelay: 120,
  checkDraw: 420,
};
const SEQ = {
  cardIn: T.envelopeIn,
  seal: T.envelopeIn + T.cardIn,
  windup: T.envelopeIn + T.cardIn + T.seal,
  launch: T.envelopeIn + T.cardIn + T.seal + T.windup,
  gone: T.envelopeIn + T.cardIn + T.seal + T.windup + T.launch,
  ret: T.envelopeIn + T.cardIn + T.seal + T.windup + T.launch + T.emptyBeat,
  idle: T.envelopeIn + T.cardIn + T.seal + T.windup + T.launch + T.emptyBeat + T.cardReturn,
};

type Phase = "idle" | "envelopeIn" | "cardIn" | "seal" | "windup" | "launch" | "gone" | "return";

const ENV_W = 320;
const ENV_H = 210;
/* spec: envelope rests ~126px below CARD CENTER - it overlaps the card's
   lower half (back panel behind the card, pocket wrapping it in front),
   which is what makes the descent read as a tuck-in. Rest top offset from
   card center = DROP - ENV_H/2 = +21px. */
const DROP = 126;
const ENV_TOP = `calc(50% + ${DROP - ENV_H / 2}px)`;

/* card copy - verbatim from Figma text node 163:816; straight apostrophes
   normalized to curly per the sitewide rule. Never rewrite here. */
const CARD_COPY = [
  "Hi! I’m Margaret, thanks for taking the time to poke around!",
  "Currently I’m co-founder and CPO at Traeco, where we’re building cost observability for AI systems: figuring out what it looks like for a team to actually see where their model spend goes before the invoice tells them. I also run BUILD at TroyLabs, USC’s first accelerator, teaching a 12-week curriculum to first-time founders.",
  "Before that I was in ops at Sirka (YC S21), and before design took over, investment banking at BNI Sekuritas in Jakarta. In between I’ve done design and product work for everything from pre-seed teams to Fortune 500 clients.",
  "I love design, development, product, and exploring the seam between them. Recently I’ve been deep in AI-native tooling, shipping real work through Claude Code and Figma MCP, and seeing how far a designer can get without ever opening a blank file.",
  "Please feel free to reach out, I love hearing about cool projects and ideas and love working with others too :)",
  "Currently seeking Fall, Spring, and Summer internships.",
];

/* marquee - Figma frame 1739326210 exports; add/replace srcs freely,
   a missing src renders the neutral placeholder tile */
const MARQUEE: { src?: string }[] = [
  { src: "/images/about/marquee-1.jpg" },
  { src: "/images/about/marquee-2.jpg" },
  { src: "/images/about/marquee-3.jpg" },
  { src: "/images/about/marquee-4.jpg" },
  { src: "/images/about/marquee-5.jpg" },
  { src: "/images/about/marquee-6.jpg" },
];

/* clipboard delivery, carried from the letter build (eed01d6):
   hidden-textarea path covers non-secure contexts */
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(EMAIL);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = EMAIL;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

/* two-face pill, mechanics carried from eed01d6: invisible widest face
   reserves the size, faces slide at +-118%, checkmark draws itself in */
function SendButton({
  copied,
  disabled,
  onActivate,
}: {
  copied: boolean;
  disabled: boolean;
  onActivate: () => void;
}) {
  return (
    <div aria-live="polite">
      <button
        onClick={onActivate}
        disabled={disabled}
        className="relative h-[58px] overflow-hidden rounded-full bg-[#1c1c1c] px-8 text-[15px] text-paper transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:hover:opacity-100"
      >
        <span className="invisible flex items-center gap-2.5" aria-hidden>
          <span className="h-[16px] w-[16px]" />
          Send me a message
        </span>
        <span
          aria-hidden={copied}
          className={`absolute inset-0 flex items-center justify-center gap-2.5 transition-all duration-300 ${
            copied ? "-translate-y-[118%] opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="m21.4 2.6-19 7.6c-.8.3-.8 1.5.1 1.7l7.6 2.2 2.2 7.6c.2.9 1.4.9 1.7.1l7.6-19c.3-.7-.5-1.5-1.2-1.2Z" />
          </svg>
          Send me a message
        </span>
        <span
          aria-hidden={!copied}
          className={`absolute inset-0 flex items-center justify-center gap-2.5 transition-all duration-300 ${
            copied ? "translate-y-0 opacity-100" : "translate-y-[118%] opacity-0"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 12.5 9.5 18 20 6.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 32,
                strokeDashoffset: copied ? 0 : 32,
                transition: copied ? `stroke-dashoffset ${T.checkDraw}ms ease ${T.checkDelay}ms` : "none",
              }}
            />
          </svg>
          Email copied
        </span>
      </button>
    </div>
  );
}

/* the bio card face - shared by the interactive and reduced-motion paths */
function CardFace() {
  return (
    <>
      {/* paper-grain texture from the Figma fill, color-burn like the mock */}
      <img
        src="/images/about/card-texture.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full rounded-[5px] object-cover mix-blend-color-burn"
      />
      {/* watermark vector (163:765 > Vector 19): low-right, behind the copy */}
      <img
        src="/images/about/card-mark.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[4%] right-[2%] w-[48%] opacity-60"
      />
      <div className="relative space-y-[1em] text-[15px] leading-normal text-white">
        {CARD_COPY.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </>
  );
}

export default function AboutCard() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [copied, setCopied] = useState(false);
  const [copiedEver, setCopiedEver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState(0.4); // capped so a tall card still fits the pocket
  const [canTilt, setCanTilt] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanTilt(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* tilt springs: rotateX +-11 (inverted so the card tips toward the
     cursor), rotateY +-14; ~680ms settle with slight overshoot */
  const rx = useSpring(0, { stiffness: 130, damping: 13, mass: 1 });
  const ry = useSpring(0, { stiffness: 130, damping: 13, mass: 1 });
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sheen = useMotionTemplate`radial-gradient(520px circle at ${mx}% ${my}%, rgba(255,255,255,0.20), transparent 55%)`;

  const tilting = canTilt && phase === "idle";

  function onMove(e: React.MouseEvent) {
    if (!tilting || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set((0.5 - py) * 22);
    ry.set((px - 0.5) * 28);
    mx.set(px * 100);
    my.set(py * 100);
  }
  function onLeave() {
    setHovered(false);
    rx.set(0);
    ry.set(0);
  }

  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  function send() {
    if (busy) return;
    copyEmail();
    setCopied(true);
    setCopiedEver(true);
    if (reduce) {
      /* no envelope at all - copy + morph + revert; the persistent line
         below is the terminal state */
      timers.current.push(window.setTimeout(() => setCopied(false), T.buttonRevert));
      return;
    }
    setBusy(true);
    setHovered(false);
    rx.set(0);
    ry.set(0);
    if (cardRef.current) {
      /* spec scale is 0.4 (exact at the mock's 452px card); taller rendered
         cards cap to the pocket's inner height so the tuck never overflows */
      const h = cardRef.current.getBoundingClientRect().height;
      setScale(Math.min(0.4, (ENV_H - 24) / h));
    }
    setPhase("envelopeIn"); // t=0; morph + checkmark land before the card moves at 620ms
    at(SEQ.cardIn, () => setPhase("cardIn"));
    at(SEQ.seal, () => setPhase("seal"));
    at(SEQ.windup, () => setPhase("windup"));
    at(SEQ.launch, () => setPhase("launch"));
    at(SEQ.gone, () => setPhase("gone")); // instant teleport, transitions off
    at(T.buttonRevert, () => setCopied(false));
    at(SEQ.ret, () => setPhase("return"));
    at(SEQ.idle, () => {
      setPhase("idle");
      setBusy(false);
    });
  }

  /* ---- derived styles, all from `phase` ---- */
  const inFlight = phase === "cardIn" || phase === "seal" || phase === "windup" || phase === "launch";
  const sealed = phase === "seal" || phase === "windup" || phase === "launch";
  const envIn = phase !== "idle" && phase !== "gone" && phase !== "return";
  const noTrans = phase === "gone" ? "!transition-none" : "";

  const wrapperStyle: React.CSSProperties =
    phase === "windup"
      ? { transform: "translateY(14px)", transition: `transform ${T.windup}ms ease-out` }
      : phase === "launch"
        ? {
            transform: "translateY(-150vh) rotate(-7deg)",
            transition: `transform ${T.launch}ms cubic-bezier(.5,0,1,.42)`,
          }
        : { transform: "none", transition: "none" };

  const cardSeqStyle: React.CSSProperties = inFlight
    ? { transform: `translateY(${DROP}px) scale(${scale})`, transition: `transform ${T.cardIn}ms cubic-bezier(.6,0,.3,1)` }
    : phase === "gone"
      ? { transform: "translateY(120vh) scale(1)", transition: "none" }
      : phase === "return"
        ? { transform: "translateY(0) scale(1)", transition: `transform ${T.cardReturn}ms cubic-bezier(.2,.7,.2,1)` }
        : { transform: "translateY(0) scale(1)" };

  const envPiece = (z: number): React.CSSProperties => ({
    zIndex: z,
    transform: envIn ? "translateY(0)" : "translateY(120vh)",
    transition: envIn ? `transform ${T.envelopeIn}ms cubic-bezier(.2,.7,.3,1)` : "none",
  });

  /* ---- reduced motion: static card, same delivery, persistent line ---- */
  if (reduce) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-[min(749px,86vw)] overflow-hidden rounded-[5px] bg-[#0f28e0] px-[6.3%] py-[4.5%] shadow-[0_23px_50px_rgba(0,0,0,0.18)]">
          <CardFace />
        </div>
        <div className="mt-[22px] flex w-[min(749px,86vw)] flex-col items-end gap-3">
          <SendButton copied={copied} disabled={copied} onActivate={send} />
          {copiedEver && (
            <p className="text-[13px] tracking-[0.02em] text-ink/50">{EMAIL} &middot; copied</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center overflow-hidden pb-6 pt-2">
      {/* stage: perspective parent (never on the card itself); clips the
          envelope's below-viewport entry and the launch exit */}
      <div style={{ perspective: "1500px" }}>
        {/* launch wrapper - windup dip + throw carry card and envelope
            together; `gone` kills every child transition for the teleport */}
        <div className={`relative ${noTrans}`} style={wrapperStyle}>
          {/* z1/z5 flap: open behind, sealing flips it shut and in front */}
          <div
            aria-hidden
            className={`absolute left-1/2 ${noTrans}`}
            style={{
              ...envPiece(sealed ? 5 : 1),
              top: ENV_TOP,
              width: ENV_W,
              marginLeft: -ENV_W / 2,
              height: ENV_H / 2,
            }}
          >
            <div
              className="h-full w-full bg-[#ede3cf]"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transformOrigin: "top center",
                transform: sealed ? "rotateX(0deg)" : "rotateX(180deg)",
                transition: `transform ${T.seal}ms ease`,
              }}
            />
          </div>
          {/* z2 envelope back panel */}
          <div
            aria-hidden
            className={`absolute left-1/2 rounded-[4px] bg-[#f2ece0] ${noTrans}`}
            style={{
              ...envPiece(2),
              top: ENV_TOP,
              width: ENV_W,
              marginLeft: -ENV_W / 2,
              height: ENV_H,
            }}
          />
          {/* z3 the card */}
          <div className={noTrans} style={{ ...cardSeqStyle, position: "relative", zIndex: 3 }}>
            <motion.div
              ref={cardRef}
              onMouseMove={onMove}
              onMouseEnter={() => tilting && setHovered(true)}
              onMouseLeave={onLeave}
              className="relative w-[min(749px,86vw)] overflow-hidden rounded-[5px] bg-[#0f28e0] px-[6.3%] py-[4.5%]"
              style={{
                rotateX: tilting ? rx : 0,
                rotateY: tilting ? ry : 0,
                translateZ: hovered && tilting ? 18 : 0,
                boxShadow: hovered && tilting
                  ? "0 36px 70px rgba(0,0,0,0.28)"
                  : "0 23px 50px rgba(0,0,0,0.18)",
                transformStyle: "preserve-3d",
                transition: `box-shadow ${T.sheenFade}ms ease`,
              }}
            >
              <CardFace />
              {/* specular sheen - follows the cursor; what makes it a surface */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[5px]"
                style={{
                  background: sheen,
                  opacity: hovered && tilting ? 1 : 0,
                  transition: `opacity ${T.sheenFade}ms ease`,
                }}
              />
            </motion.div>
          </div>
          {/* z4 envelope front pocket - the V-notch tucks the card in */}
          <div
            aria-hidden
            className={`absolute left-1/2 ${noTrans}`}
            style={{
              ...envPiece(4),
              top: ENV_TOP,
              width: ENV_W,
              marginLeft: -ENV_W / 2,
              height: ENV_H,
            }}
          >
            <div
              className="h-full w-full rounded-b-[4px] bg-[#e6ddca]"
              style={{ clipPath: "polygon(0 34%, 50% 68%, 100% 34%, 100% 100%, 0 100%)" }}
            />
          </div>
        </div>
      </div>
      {/* trigger, right-aligned to the card edge like the mock; stays put
          through the flight */}
      <div className="mt-[22px] flex w-[min(749px,86vw)] justify-end">
        <SendButton copied={copied} disabled={busy || copied} onActivate={send} />
      </div>
    </div>
  );
}

/* full-bleed photo strip; the duplicated set is aria-hidden and the track
   animation lives in globals.css (@keyframes about-marquee) */
export function AboutMarquee() {
  const reduce = useReducedMotion();
  const tiles = [...MARQUEE, ...MARQUEE];
  return (
    <div
      aria-hidden
      className="w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 13%, #000 87%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 13%, #000 87%, transparent)",
      }}
    >
      <div
        className="flex w-max gap-[18px]"
        style={{
          animation: `about-marquee 46s linear infinite`,
          animationPlayState: reduce ? "paused" : "running",
        }}
      >
        {tiles.map((t, i) => (
          <div
            key={i}
            aria-hidden={i >= MARQUEE.length}
            className="relative h-[136px] w-[212px] shrink-0 overflow-hidden rounded-[4px] bg-placeholder"
          >
            {t.src && (
              <Image src={t.src} alt="" fill sizes="212px" className="object-cover" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
