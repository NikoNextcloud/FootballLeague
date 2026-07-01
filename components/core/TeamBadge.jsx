import React, { useState } from "react";

// Renders a team crest image with a graceful initials fallback when the
// badge fails to load (mirrors the source app's onError behavior).
export function TeamBadge({ src, name, size = 28 }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    const initials = (name || "")
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
    return (
      <span
        aria-hidden
        style={{
          width: size,
          height: size,
          fontSize: size * 0.36,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "var(--radius-md)",
          fontWeight: "var(--weight-bold)",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
          flexShrink: 0,
        }}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "var(--radius-sm)",
        flexShrink: 0,
      }}
    />
  );
}
