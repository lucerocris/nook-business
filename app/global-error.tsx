"use client";

// Catches errors in the root layout itself, so it must render its own <html>/
// <body> and can't rely on app CSS — inline styles only.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Poppins', Arial, sans-serif",
          backgroundColor: "#f7faf7",
          color: "#3b3b3b",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: "12px", maxWidth: "28rem", fontSize: "14px", color: "#6b7280" }}>
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
