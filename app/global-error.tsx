"use client";

// Catches errors in the root layout itself, so it must render its own <html>/
// <body> and can't rely on app CSS — inline styles only. The theme provider
// lives in that layout too, so dark colours follow the OS setting here rather
// than the in-app toggle.
const THEME_CSS = `
  :root { color-scheme: light dark; --bg: #f7faf7; --fg: #3b3b3b; --heading: #111827; --muted: #6b7280; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0e1210; --fg: #c8cdc8; --heading: #f1f4f1; --muted: #9aa19b; }
  }
`;

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <style>{THEME_CSS}</style>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Poppins', Arial, sans-serif",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--heading)" }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: "12px", maxWidth: "28rem", fontSize: "14px", color: "var(--muted)" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "24px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#3A5A40",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
