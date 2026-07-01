export interface TeamBadgeProps {
  /** Badge image URL (TheSportsDB crest, jpg/png). Omit or leave broken to see the fallback. */
  src?: string | null;
  /** Team name — used to derive fallback initials and as accessible context. */
  name: string;
  /** Square size in px. Used at 22 (table rows), 26 (match cards), 48 (team grid), 64 (team header). */
  size?: number;
}
