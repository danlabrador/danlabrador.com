import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Dan Labrador").slice(0, 140);
  const kicker = (searchParams.get("kicker") ?? "danlabrador.com").slice(0, 60);
  const meta = searchParams.get("meta") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#9ca3af",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: title.length > 60 ? 68 : 84,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#9ca3af",
          }}
        >
          <div style={{ display: "flex", fontWeight: 600, color: "#fafafa" }}>Dan Labrador</div>
          {meta ? <div style={{ display: "flex" }}>{meta}</div> : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
