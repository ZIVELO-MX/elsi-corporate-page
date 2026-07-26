import { ImageResponse } from "next/og";

export const alt = "ELSI, educación y soluciones ambientales";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#F7F6F2",
          color: "#1C231F",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: "70px 78px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            maxWidth: 850,
          }}
        >
          <div
            style={{
              color: "#4A7A7E",
              display: "flex",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            ELSI
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "flex",
                fontSize: 66,
                fontWeight: 800,
                letterSpacing: -2.5,
                lineHeight: 1.08,
              }}
            >
              Educación y soluciones ambientales
            </div>
            <div
              style={{
                color: "#596157",
                display: "flex",
                fontSize: 25,
                lineHeight: 1.4,
              }}
            >
              Conocimiento para aprender, decidir y actuar.
            </div>
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            alignSelf: "flex-end",
            background: "#4A7A7E",
            borderRadius: 22,
            color: "#F7F6F2",
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            height: 128,
            justifyContent: "center",
            width: 128,
          }}
        >
          E
        </div>
      </div>
    ),
    size,
  );
}
