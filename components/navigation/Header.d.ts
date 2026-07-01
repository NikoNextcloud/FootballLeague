export interface HeaderProps {
  /** Current route, used to underline the active top-nav link. */
  activePath?: string;
  onNavigate?: (path: string) => void;
  /** Usually an <IconButton> (the notify bell) — pass null to omit. */
  notifySlot?: React.ReactNode;
  logoSrc?: string;
}
