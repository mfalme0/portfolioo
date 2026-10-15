import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const alt = `${SITE_NAME} — Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A generated social card in the brand palette (base near-black, lime accent).
// Uses next/og's built-in font; no network font fetch at build time.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#08090c",
          backgroundImage:
            "radial-gradient(120% 90% at 80% 10%, rgba(200,255,77,0.12), transparent 55%)",
          fontFamily: "sans-serif",
          color: "#f4f6fa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 26,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#a8b0c0",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "#c8ff4d",
            }}
          />
          Software Engineer · Nairobi
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: 110,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 40,
              color: "#a8b0c0",
              maxWidth: 900,
              lineHeight: 1.25,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 28,
            color: "#c8ff4d",
          }}
        >
          github.com/mfalme0
        </div>
      </div>
    ),
    { ...size },
  );
}
