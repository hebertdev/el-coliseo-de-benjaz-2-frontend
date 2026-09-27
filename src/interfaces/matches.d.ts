export interface PlayerMatchTeam {
  id: number | null;
  name: string;
  tag: string;
  slug: string | null;
  logo_url: string | null;
  score: number;
  is_player_team?: boolean;
}

export interface PlayerMatchHero {
  id: number;
  name: string;
  image_url: string | null;
}

export interface PlayerMatchStats {
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  last_hits: number;
  denies: number;
  gpm: number;
  xpm: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  net_worth: number;
  stuns: number;
}

export interface PlayerMatchItem {
  game_id: number;
  game_slug: string;
  game_number: number;
  duration_seconds: number;
  duration_formatted: string;
  date: string | null;
  date_formatted: string;
  date_key: string;
  tournament_name: string;
  round_name: string;
  player_side: "radiant" | "dire";
  player_won: boolean;
  hero: PlayerMatchHero;
  player_team: PlayerMatchTeam;
  rival_team: PlayerMatchTeam;
  radiant_team: PlayerMatchTeam;
  dire_team: PlayerMatchTeam;
  stats: PlayerMatchStats;
}

export interface PlayerMatchGroup {
  date: string;
  date_formatted: string;
  matches: PlayerMatchItem[];
}

export interface PlayerMatchHistoryResponse {
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  grouped_by_date: PlayerMatchGroup[];
  matches: PlayerMatchItem[];
}

// Team Series History
export interface TeamSeriesGame {
  id: number;
  slug: string;
  game_number: number;
  status: string;
  duration_seconds: number;
  duration_formatted: string | null;
  winner_tag: string | null;
}

export interface TeamSeriesTeam {
  id: number;
  name: string;
  tag: string;
  slug: string;
  logo_url: string | null;
  score: number;
  is_current: boolean;
  record: string;
}

export interface TeamSeriesItem {
  series_id: number;
  series_slug: string;
  best_of: string;
  status: string;
  status_display: string;
  date: string | null;
  date_formatted: string;
  date_key: string;
  tournament_name: string;
  round_name: string;
  team_a: TeamSeriesTeam;
  team_b: TeamSeriesTeam;
  score_a: number;
  score_b: number;
  winner_id: number | null;
  is_winner: boolean;
  first_game_slug: string | null;
  games: TeamSeriesGame[];
}

export interface TeamSeriesGroup {
  date: string;
  date_formatted: string;
  series: TeamSeriesItem[];
}

export interface TeamSeriesHistoryResponse {
  total_series: number;
  completed_series: number;
  wins: number;
  losses: number;
  win_rate: number;
  grouped_by_date: TeamSeriesGroup[];
  series: TeamSeriesItem[];
}

export interface LiveDraftPick {
  hero_id: number;
  hero_name: string;
  image_url: string | null;
}

export interface SeriesLiveMatchData {
  series_slug: string;
  best_of: string;
  status: string;
  score_a: number;
  score_b: number;
  team_a: {
    name: string | null;
    tag: string | null;
    slug: string | null;
  };
  team_b: {
    name: string | null;
    tag: string | null;
    slug: string | null;
  };
  current_game: {
    slug: string | null;
    game_number: number;
    status: string;
    duration_seconds: number;
    opendota_match_id?: number | null;
    radiant_picks: LiveDraftPick[];
    dire_picks: LiveDraftPick[];
  } | null;
}

