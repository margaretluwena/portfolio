import { ImageResponse } from "next/og";

/*
  OG card: the texture palette as a soft gradient wash, wordmark + tagline.
  (The real texture PNG can't ship into the edge runtime cheaply; this gradient
  samples its colors — sage, pale yellow-green, soft blue — fading to white,
  matching the intro frame's read at card size.)
*/

export const alt = "Margaret Luwena — design engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background:
            "linear-gradient(165deg, #aeb884 0%, #b8c4a0 22%, #c3cfc0 40%, #cdd8dc 55%, #e9eef0 75%, #ffffff 100%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 84, letterSpacing: "-4px", color: "#000", fontWeight: 500 }}>
          MARGARET LUWENA
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 34, fontStyle: "italic", color: "#a728ab" }}>
          is a design engineer
        </div>
      </div>
    ),
    size
  );
}
