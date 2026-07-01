export interface TableRow {
  idTeam: string;
  strTeam: string;
  strBadge?: string;
  intRank: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  strForm?: string;
}

export interface StandingsTableProps {
  rows: TableRow[];
  /** Hides W/D/L, GF:GA and form columns — used on the homepage top-8 preview. */
  compact?: boolean;
}
