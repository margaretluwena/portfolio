"use client";

/*
  ABOUT - blue bio card + photo marquee.
  Source of truth: Figma "About page" 163:765 (page "Portfolio Revamp").
  Spec doc: docs/ABOUT_CARD.md.

  The card tilts toward the cursor (motion springs - a CSS transition
  restarts toward each new target and reads as stepping; a spring damps a
  moving target and gives the slight overshoot for free) with a sheen that
  follows it. Below the card: the ways to reach Margaret - LinkedIn, X,
  Instagram, and a mail icon for her address - the same icons as the home
  column. The "Send me a message" button and the envelope-send sequence it
  triggered were retired 2026-10-08 (Margaret: "a bit much"); the old
  build is in git history (components/about/AboutCard.tsx before that
  date) if it is ever wanted back.
*/

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { socials } from "@/components/shell/PortfolioShell";

const EMAIL = "luwena@usc.edu";

const CARD_COPY = [
  "Hi! I’m Margaret, thanks for taking the time to poke around!",
  "Currently I’m co-founder and CPO at Traeco, where we’re building cost observability for AI systems: figuring out what it looks like for a team to actually see where their model spend goes before the invoice tells them. I also run BUILD at TroyLabs, USC’s first accelerator, teaching an 8-week curriculum to first-time founders.",
  "Before that I was in ops at Sirka (YC S21), and before design took over, investment banking at BNI Sekuritas in Jakarta. In between I’ve done design and product work for everything from pre-seed teams to Fortune 500 clients.",
  "I love design, development, product, and exploring the seam between them. Recently I’ve been deep in AI-native tooling, shipping real work through Claude Code and Figma MCP, and seeing how far a designer can get without ever opening a blank file.",
  "Please feel free to reach out, I love hearing about cool projects and ideas and love working with others too :)",
  "Currently seeking Summer 2027 internships.",
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

function CardFace() {
  return (
    <>
      {/* paper-grain texture from the Figma fill, color-burn like the mock */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/about/card-texture.jpg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full rounded-[5px] object-cover mix-blend-color-burn"
      />
      {/* watermark vector (163:765 > Vector 19): low-right, behind the copy */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/about/card-mark.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[4%] right-[2%] w-[48%] opacity-60"
      />
      <div className="relative space-y-[1em] text-[14px] leading-normal text-white">
        {CARD_COPY.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </>
  );
}

/* the ways to reach her: mail on the card's left edge, the home column's
   three icons on its right edge, all sized to equal visible height (see
   `ink` in PortfolioShell) (Margaret, 2026-10-08) */
function ContactRow() {
  const link =
    "block opacity-45 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";
  return (
    <ul className="mt-[22px] flex w-[min(620px,86vw)] items-center gap-5">
      <li className="mr-auto">
        <a href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`} title={EMAIL} className={link}>
          <svg width="26" height="24" viewBox="0 0 26 24" fill="none" aria-hidden>
            <rect x="1.5" y="4" width="23" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M2.5 6.5 13 13.5 23.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </li>
      {socials.map((s) => (
        <li key={s.label}>
          <a href={s.href} aria-label={s.label} target="_blank" rel="noreferrer" className={link}>
            <Image src={s.icon} alt="" width={24} height={24} className="w-auto" style={{ height: 24 / s.ink }} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function AboutCard() {
  const reduce = useReducedMotion();
  const [canTilt, setCanTilt] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanTilt(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* tilt springs: rotateX +-5 (inverted so the card tips toward the
     cursor), rotateY +-6 - halved from +-11/+-14, which read as twitchy
     between corners (Margaret, 2026-10-08); a little more damping so it
     settles without the wobble */
  const rx = useSpring(0, { stiffness: 130, damping: 16, mass: 1 });
  const ry = useSpring(0, { stiffness: 130, damping: 16, mass: 1 });
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sheen = useMotionTemplate`radial-gradient(520px circle at ${mx}% ${my}%, rgba(255,255,255,0.20), transparent 55%)`;
  const tilting = canTilt && !reduce;

  function onMove(e: React.MouseEvent) {
    if (!tilting || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set((0.5 - py) * 10);
    ry.set((px - 0.5) * 12);
    mx.set(px * 100);
    my.set(py * 100);
  }
  function onLeave() {
    setHovered(false);
    rx.set(0);
    ry.set(0);
  }

  return (
    <div className="flex flex-col items-center pb-6 pt-2">
      {/* perspective parent (never on the card itself) */}
      <div style={{ perspective: "1500px" }}>
        <motion.div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseEnter={() => tilting && setHovered(true)}
          onMouseLeave={onLeave}
          className="relative w-[min(620px,86vw)] overflow-hidden rounded-[5px] bg-[#0f28e0] px-[6.3%] py-[4.5%]"
          style={{
            rotateX: tilting ? rx : 0,
            rotateY: tilting ? ry : 0,
            translateZ: hovered && tilting ? 18 : 0,
            /* flat on the page at rest; the shadow exists only paired with
               the hover lift - that pairing is what makes the tilt physical */
            boxShadow: hovered && tilting ? "0 36px 70px rgba(0,0,0,0.28)" : "none",
            transformStyle: "preserve-3d",
            transition: "box-shadow 300ms ease",
          }}
        >
          <CardFace />
          {/* the sheen follows the cursor; only while hovering */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[5px]"
            style={{ background: sheen, opacity: hovered && tilting ? 1 : 0, transition: "opacity 300ms ease" }}
          />
        </motion.div>
      </div>
      <ContactRow />
    </div>
  );
}

export function AboutMarquee() {
  const reduce = useReducedMotion();
  const tiles = [...MARQUEE, ...MARQUEE];
  return (
    <div
      aria-hidden
      className="pointer-events-none w-full select-none overflow-hidden"
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
              <Image src={t.src} alt="" fill sizes="212px" draggable={false} className="object-cover" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
