// src/types.ts

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
  strDescription?: string;
}

export interface EventItem {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string; // YYYY-MM-DD
  strTime: string | null;
  strStatus?: string | null;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  strVenue?: string | null;
  intRound?: string | null;
}

export interface TeamItem {
  idTeam: string;
  strTeam: string;
  strBadge?: string;
  strStadium?: string;
  strStadiumThumb?: string;
  strDescriptionEN?: string;
  strWebsite?: string;
  strFacebook?: string;
  strInstagram?: string;
  intFormedYear?: string;
  strCountry?: string;
}

export interface ScorerEntry {
  player: string;
  team: string;
  teamBadge?: string;
  goals: number;
}

export interface ScorersData {
  updatedAt: string;
  processedMatches: number;
  totalMatches: number;
  note: string;
  list: ScorerEntry[];
}

export interface ArchiveSeasonData {
  season: string;
  updatedAt: string;
  table: TableRow[];
  events: EventItem[];
}

export interface LeagueData {
  meta: {
    season: string;
    leagueId: string;
    updatedAt: string;
    source: string;
  };
  table: TableRow[];
  events: EventItem[];
  teams: TeamItem[];
  next: EventItem[];
  past: EventItem[];
}
