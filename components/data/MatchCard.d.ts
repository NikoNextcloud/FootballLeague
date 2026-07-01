export interface EventItem {
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime?: string | null;
  strStatus?: string | null;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  strVenue?: string | null;
  intRound?: string | null;
}

export interface MatchCardProps {
  event: EventItem;
}
