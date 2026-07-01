export interface IconButtonProps {
  children: React.ReactNode;
  /** True when the toggle is in its "on"/subscribed state — draws an accent border. */
  on?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}
