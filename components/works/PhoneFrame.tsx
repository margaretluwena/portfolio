/*
  ONE phone mockup for the whole site (Margaret, 2026-11-14: the earlier
  frame read "fat"; it had a wide grey rim around a wide black bezel, on a
  box whose shape squeezed the screen).

  Drawn to an iPhone's real proportions. The screen is 402 x 874 points,
  the same shape as the Figma exports, so a screenshot fills it edge to
  edge with nothing cropped. Around it: a 10pt black bezel, then a 4pt
  titanium band, 430 x 902 overall, corners at 55pt. Everything is a
  percentage of the frame's width, so it holds at any size; the caller
  only sets the width.

  Children fill the screen (position them absolutely, or give an image
  `absolute inset-0 h-full w-full object-cover object-top`).
*/
export default function PhoneFrame({ children, className = "", shadow = true }: { children: React.ReactNode; className?: string; shadow?: boolean }) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: "430 / 902" }}>
      {/* side buttons: action and the two volume keys on the left, power on the right */}
      {[
        { side: "left", top: "15.6%", h: "3.4%" },
        { side: "left", top: "21.4%", h: "6.4%" },
        { side: "left", top: "29.4%", h: "6.4%" },
        { side: "right", top: "24.6%", h: "10.4%" },
      ].map((b) => (
        <span
          key={b.side + b.top}
          aria-hidden
          className="absolute bg-[#2c2c30]"
          style={{ [b.side]: "-0.55%", top: b.top, height: b.h, width: "0.9%", borderRadius: b.side === "left" ? "2px 0 0 2px" : "0 2px 2px 0" }}
        />
      ))}
      {/* the titanium band */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: "12.8% / 6.1%",
          padding: "0.93%",
          background: "linear-gradient(150deg, #4a4a4f 0%, #26262a 38%, #1a1a1d 62%, #35353a 100%)",
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.14)${shadow ? ", 0 1px 2px rgba(0,0,0,0.22), 0 26px 50px rgba(0,0,0,0.20), 0 8px 18px rgba(0,0,0,0.12)" : ""}`,
        }}
      >
        {/* the bezel */}
        <div className="h-full w-full bg-black" style={{ borderRadius: "12.1% / 5.7%", padding: "2.4%" }}>
          {/* the screen */}
          <div className="relative h-full w-full overflow-hidden bg-[#f2f2f2]" style={{ borderRadius: "10.2% / 4.7%" }}>
            {children}
            {/* the island */}
            <span aria-hidden className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black" style={{ top: "1.5%", width: "30%", height: "3.9%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
