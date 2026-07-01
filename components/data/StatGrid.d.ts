export interface Stat {
  value: string | number;
  label: string;
}

export interface StatGridProps {
  stats: Stat[];
}
