export interface TournamentMiniInfo {
  slug: string;
  name: string;
}

export interface JornadaInfo {
  id: string;
  title: string;
  stage_name: string;
  round_number: number;
  date: string | null;
  date_display: string | null;
  is_completed: boolean;
  total_series: number;
  completed_series: number;
  total_games_analyzed: number;
}

export interface CurrentStatusInfo {
  is_latest_completed: boolean;
  ongoing_jornada_id: string | null;
  ongoing_jornada_title: string | null;
  message: string;
}

export interface AvailableJornada {
  id: string;
  type: string;
  round_number: number;
  title: string;
  stage_name: string;
  stage_slug: string;
  stage_type: string;
  total_series: number;
  completed_series: number;
  ongoing_series: number;
  scheduled_series: number;
  is_completed: boolean;
  date: string | null;
  date_display: string | null;
  games_with_telemetry: number;
}

export interface DayPlayerHero {
  hero_id: number;
  hero_name: string;
  image_url: string | null;
  games_played: number;
  wins: number;
  game_slug?: string | null;
  game_slugs?: string[];
}

export interface DayPlayerStats {
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_gpm: number;
  avg_xpm: number;
  avg_hero_damage: number;
  avg_tower_damage: number;
  avg_healing: number;
  avg_stuns_seconds: number;
  avg_wards_placed: number;
  avg_wards_dewarded: number;
  avg_camps_stacked: number;
}

export interface DayPlayerMedal {
  rank_tier: number | null;
  leaderboard_rank: number | null;
  medal_title: string;
  medal_tier: string;
  medal_stars: number;
}

export interface DayPlayerTeam {
  slug: string | null;
  name: string | null;
  tag: string | null;
  logo_url: string | null;
}

export interface DayPlayerSocials {
  kick?: string | null;
  twitch?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  steam?: string | null;
  dotabuff?: string | null;
}

export interface DayPlayer {
  rank: number;
  score: number;
  player_slug: string;
  steam_id?: string | null;
  account_id?: number | null;
  nickname: string;
  avatar: string | null;
  country: string | null;
  position: number | null;
  position_name: string;
  medal: DayPlayerMedal;
  team: DayPlayerTeam;
  social_links?: DayPlayerSocials;
  mvp_count: number;
  stats: DayPlayerStats;
  heroes_played: DayPlayerHero[];
}


export interface PlayerOfTheDayResponse {
  tournament: TournamentMiniInfo;
  jornada: JornadaInfo;
  current_status: CurrentStatusInfo;
  available_jornadas: AvailableJornada[];
  player_of_the_day: DayPlayer | null;
  top_3_players: DayPlayer[];
  all_ranked_players: DayPlayer[];
}
