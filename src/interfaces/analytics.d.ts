export interface TournamentInfo {
  slug: string;
  name: string;
  total_games_analyzed: number;
  last_updated_at: string;
}

export interface AnalyticsSummary {
  total_games_analyzed: number;
  total_kills: number;
  avg_game_duration_seconds: number;
  avg_game_duration_formatted: string;
}

export interface PlayerMedal {
  rank_tier: number | null;
  leaderboard_rank: number | null;
  medal_title: string;
  medal_tier: string;
  medal_stars: number;
}

export interface PlayerTeam {
  slug: string;
  name: string;
  tag: string;
  logo_url: string | null;
}

export interface PlayerStats {
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  kda: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_gpm: number;
  avg_xpm: number;
  avg_hero_damage: number;
  avg_tower_damage: number;
  avg_healing: number;
  avg_wards_placed: number;
  avg_wards_dewarded: number;
  avg_camps_stacked: number;
  avg_stuns_seconds: number;
  avg_last_hits: number;
  total_kills: number;
  total_assists: number;
  mvp_count?: number;
}

export interface PositionPlayer {
  player_slug: string;
  nickname: string;
  avatar: string | null;
  country: string | null;
  position: number;
  position_name?: string;
  medal: PlayerMedal;
  team: PlayerTeam;
  stats: PlayerStats;
  rank: number;
  score?: number;
  placement_status?: string;
  placement_multiplier?: number;
  adjusted_win_rate?: number;
  volume_factor?: number;
  is_standin?: boolean;
}

export interface DreamTeam {
  carry: PositionPlayer;
  mid: PositionPlayer;
  offlane: PositionPlayer;
  soft_support: PositionPlayer;
  hard_support: PositionPlayer;
}

export interface PlayersByPosition {
  carry: PositionPlayer[];
  mid: PositionPlayer[];
  offlane: PositionPlayer[];
  soft_support: PositionPlayer[];
  hard_support: PositionPlayer[];
}

export interface CourierSniper {
  player_slug: string;
  nickname: string;
  player_avatar: string | null;
  team_name: string;
  team_slug: string;
  team_logo_url: string | null;
  couriers_killed: number;
}

export interface EarliestFirstBlood {
  seconds: number;
  time_formatted: string;
  player_slug: string;
  nickname: string;
  player_avatar: string | null;
  game_slug: string;
}

export interface HighlightHero {
  hero_id: number;
  hero_name: string;
  image_url: string;
}

export interface MostDeathsSingleGame {
  player_slug: string;
  nickname: string;
  player_avatar: string | null;
  deaths: number;
  hero: HighlightHero;
  game_slug: string;
}

export interface LowestWinrateHero {
  hero_id: number;
  hero_name: string;
  image_url: string;
  picks: number;
  losses: number;
  wins: number;
  win_rate: number;
}

export interface TopStunner {
  player_slug: string;
  nickname: string;
  player_avatar: string | null;
  team_slug: string;
  team_logo_url: string | null;
  avg_stuns_seconds: number;
}

export interface MostPurchasedItem {
  item_name: string;
  count: number;
}

export interface CommunityHighlights {
  top_courier_snipers: CourierSniper[];
  earliest_first_blood: EarliestFirstBlood;
  most_deaths_single_game: MostDeathsSingleGame;
  lowest_winrate_heroes: LowestWinrateHero[];
  top_stunner: TopStunner;
  most_purchased_items: MostPurchasedItem[];
}

export interface LeaderPlayer {
  player_slug: string;
  nickname: string;
  avatar: string | null;
  team_slug: string;
  team_name?: string | null;
  team_tag?: string | null;
  team_logo_url: string | null;
  position: number;
  medal: PlayerMedal;
  kda?: number;
  avg_gpm?: number;
  avg_kills?: number;
  total_kills?: number;
  avg_wards_placed?: number;
  avg_wards_dewarded?: number;
  mvp_count?: number;
}

export interface IndividualLeaders {
  top_kda: LeaderPlayer[];
  top_gpm: LeaderPlayer[];
  top_killers: LeaderPlayer[];
  top_vision: LeaderPlayer[];
  top_mvps?: LeaderPlayer[];
}

export interface RecordGameDuration {
  game_slug: string;
  duration_seconds: number;
  duration_formatted: string;
  winner_slug: string | null;
  winner_name: string | null;
  winner_logo_url: string | null;
}

export interface BloodiestGame {
  game_slug: string;
  total_kills: number;
  radiant_kills: number;
  dire_kills: number;
}

export interface RecordPlayerHeroStat {
  player_slug: string;
  nickname: string;
  player_avatar: string | null;
  kills?: number;
  gpm?: number;
  hero_damage?: number;
  hero: HighlightHero;
  game_slug: string;
}

export interface TournamentRecords {
  fastest_game: RecordGameDuration;
  longest_game: RecordGameDuration;
  bloodiest_game: BloodiestGame;
  most_kills_single_game: RecordPlayerHeroStat;
  highest_gpm_single_game: RecordPlayerHeroStat;
  highest_damage_single_game: RecordPlayerHeroStat;
}

export interface HeroMetaEntry {
  hero_id: number;
  hero_name: string;
  image_url: string;
  picks: number;
  bans: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface HeroMeta {
  most_picked: HeroMetaEntry[];
  most_banned: HeroMetaEntry[];
  highest_winrate: HeroMetaEntry[];
  lowest_winrate?: HeroMetaEntry[];
  all_heroes?: HeroMetaEntry[];
}

export interface TeamPerformance {
  slug: string;
  name: string;
  tag: string;
  logo_url: string | null;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_duration_seconds: number;
  avg_duration_formatted: string;
  kill_death_ratio: number;
  total_kills: number;
  total_deaths: number;
}

export interface MvpHeroStat {
  hero_id: number;
  hero_name: string;
  image_url: string;
  games_played: number;
  wins?: number;
  win_rate?: number;
}

export interface TournamentMvpData {
  is_provisional: boolean;
  title: string;
  badge_label: string;
  reason: string;
  player_slug: string;
  nickname: string;
  avatar: string | null;
  country: string | null;
  position: number;
  position_short: string;
  position_display: string;
  medal: PlayerMedal;
  team: PlayerTeam;
  score: number;
  placement_status: string;
  stats: PlayerStats;
  top_heroes: MvpHeroStat[];
  is_champion?: boolean;
}

export interface TournamentAnalyticsResponse {
  tournament: TournamentInfo;
  summary: AnalyticsSummary;
  tournament_mvp?: TournamentMvpData | null;
  dream_team: DreamTeam;
  dream_team_secondary?: DreamTeam;
  players_by_position: PlayersByPosition;
  community_highlights: CommunityHighlights;
  individual_leaders: IndividualLeaders;
  tournament_records: TournamentRecords;
  hero_meta: HeroMeta;
  team_performance: TeamPerformance[];
}
