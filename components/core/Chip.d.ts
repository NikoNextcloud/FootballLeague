export interface ChipProps {
  /** Whether this chip is the selected filter. Renders solid green when true. */
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface ChipGroupProps {
  children: React.ReactNode;
}
