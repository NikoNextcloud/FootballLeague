// src/components/TeamBadge.tsx
import { useState } from "react";

export default function TeamBadge({
  src,
  name,
  size = 28,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    const initials = name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
    return (
      <span
        className="team-badge team-badge--fallback"
        style={{ width: size, height: size, fontSize: size * 0.36 }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      className="team-badge"
      src={src ?? undefined}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
