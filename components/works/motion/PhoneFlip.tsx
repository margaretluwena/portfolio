"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";

/*
  MARK, SETUP: one phone that stays put while its screens change
  (Michelle Liu's review, 2026-11-14: "keep the frame static and then have
  the screens flip through", which was Margaret's original idea; the
  recording this replaces slid whole phones sideways, and as a video it
  read a little blurry). Drawn live from the Figma screen exports, so it is
  as sharp as the display.

  Seven screens, the same run as the recording: home, the library by
  category, the library by book, a note, then the share screen with each of
  the three card styles laid into its card slot. The next screen slides in
  over the last inside the frame. It runs only while in view; reduced
  motion shows the first screen and nothing moves.
*/

const DIR = "/images/mark/flip";
const SCREENS: { shot: string; art?: string; name: string }[] = [
  { shot: "01-home.png", name: "Home" },
  { shot: "02-categories.png", name: "Library by category" },
  { shot: "03-books.png", name: "Library by book" },
  { shot: "04-note.png", name: "A note" },
  { shot: "07-share-envelope.png", art: "style-envelope.webp", name: "Share: a letter" },
  { shot: "07-share-envelope.png", art: "style-postcard.png", name: "Share: a postcard" },
  { shot: "07-share-envelope.png", art: "style-sticky.png", name: "Share: a sticky note" },
];
const DWELL = 1900;

export default function PhoneFlip() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const id = setInterval(() => setI((k) => (k + 1) % SCREENS.length), DWELL);
    return () => clearInterval(id);
  }, [reduce, inView]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label="The Mark app in a phone: home, the library by category and by book, a note, and the three share cards"
      className="grid w-full place-items-center rounded-[4px] bg-[#f6f5f1] py-[9%]"
    >
      {/* the frame: the same titanium phone as the home card (CardHover) */}
      <div
        className="relative w-[62%] rounded-[15.5%/7.1%]"
        style={{
          aspectRatio: "284 / 617",
          background: "linear-gradient(160deg, #5d5d62 0%, #3a3a3e 40%, #2b2b2f 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.18), 0 22px 44px rgba(0,0,0,0.13), 0 6px 14px rgba(0,0,0,0.08)",
          padding: "2.6%",
        }}
      >
        <div className="h-full w-full rounded-[13.3%/6.1%] bg-[#0c0c0e]" style={{ padding: "3.4%" }}>
          <div className="relative h-full w-full overflow-hidden rounded-[10.5%/4.8%] bg-[#f2f2f2]">
            {SCREENS.map((s, k) => {
              /* the current screen sits in place; the ones before it have left
                 to the left, the ones after wait on the right */
              const x = k === i ? 0 : k < i ? -100 : 100;
              return (
                <div
                  key={s.name}
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    transform: `translateX(${x}%)`,
                    /* the wrap from the last screen back to the first cuts, it does not rewind across all seven */
                    transition: reduce || Math.abs(k - i) > 1 ? "none" : "transform 640ms cubic-bezier(0.22, 1, 0.36, 1)",
                    visibility: Math.abs(k - i) > 1 ? "hidden" : "visible",
                  }}
                >
                  <Image src={`${DIR}/${s.shot}`} alt="" fill sizes="(max-width: 768px) 60vw, 22vw" className="object-cover object-top" priority={k === 0} />
                  {s.art && (
                    /* the share screen's card slot (20,92 230x340 on the 270x603 screen) */
                    <div className="absolute grid place-items-center bg-[#e9e9e9]" style={{ left: "7.4%", top: "15.26%", width: "85.2%", height: "56.4%" }}>
                      <div className="relative h-full w-full">
                        <Image src={`${DIR}/${s.art}`} alt="" fill sizes="(max-width: 768px) 50vw, 18vw" className="object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {/* the island */}
            <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#0c0c0e]" style={{ top: "2.1%", width: "27%", height: "3.6%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
