export interface GameRosterPlayer {
  slug: string;
  nickname: string;
  full_name: string;
  avatar: string | null;
  steam_id: string | null;
  account_id: number | null;
  mmr_number: number | null;
  country: string;
  city: string;
  region: string;
  role: string;
  role_display: string;
  competitive_position: number;
  position_display: string;
  is_active: boolean;
}

export interface GameTeamData {
  name: string;
  slug: string;
  tag: string;
  logo_url: string | null;
  region: string;
  country: string;
  players?: GameRosterPlayer[];
}

export interface GameHeroData {
  has_hero: boolean;
  hero_id: number | null;
  hero_name: string | null;
  image_url: string | null;
}

export interface OpenDotaChatEvent {
  key: string;
  slot: number;
  time: number;
  type: string;
  player_slot?: number;
}

export interface OpenDotaLeague {
  name: string;
  tier: string;
  banner: string | null;
  ticket: string | null;
  leagueid: number;
}

export interface OpenDotaPause {
  time: number;
  duration: number;
}

export interface OpenDotaOdData {
  has_api: boolean;
  has_gcdata: boolean;
  has_parsed: boolean;
  has_archive: boolean;
}

export interface OpenDotaStratzMetadata {
  imp?: number;
  award?: string;
  seasonRank?: number | null;
  seasonLeaderboardRank?: number | null;
}

export interface OpenDotaBenchmarkValue {
  pct: number;
  raw: number;
  pct_bracket?: number;
}

export interface OpenDotaLogEvent {
  key: string;
  time: number;
  smoke?: boolean;
  charges?: number;
}

export interface OpenDotaBuybackLog {
  slot: number;
  time: number;
  type: string;
  player_slot: number;
}

export interface OpenDotaWardLog {
  x: number;
  y: number;
  z: number;
  key: string;
  slot: number;
  time: number;
  type: string;
  ehandle: number;
  entityleft: boolean;
  player_slot: number;
  attackername?: string;
}

export interface OpenDotaNeutralItemHistory {
  time: number;
  item_neutral?: string;
  item_neutral_enhancement?: string;
}

export interface OpenDotaPermanentBuff {
  grant_time: number;
  stack_count: number;
  permanent_buff: number;
}

export interface OpenDotaPickBan {
  is_pick: boolean;
  hero_id: number;
  team: number;
  order: number;
}

export interface OpenDotaMaxHeroHit {
  key: string;
  max: boolean;
  slot: number;
  time: number;
  type: string;
  unit: string;
  value: number;
  inflictor?: string;
  player_slot: number;
}

export interface OpenDotaAdditionalUnit {
  unitname?: string;
  item_0?: number;
  item_1?: number;
  item_2?: number;
  item_3?: number;
  item_4?: number;
  item_5?: number;
  backpack_0?: number;
  backpack_1?: number;
  backpack_2?: number;
  item_neutral?: number;
  item_neutral2?: number;
}

export interface OpenDotaPlayer {
  account_id: number;
  personaname: string | null;
  name: string | null;
  player_slot: number;
  team_number: number;
  team_slot: number;
  hero_id: number;
  hero_variant?: number;
  level: number;
  additional_units?: OpenDotaAdditionalUnit[];
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  last_hits: number;
  denies: number;
  gold: number;
  total_gold: number;
  net_worth: number;
  gold_spent: number;
  gold_per_min: number;
  xp_per_min: number;
  total_xp: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  stuns: number;
  pings: number;
  isRadiant: boolean;
  win: number;
  lose: number;
  abandons: number;
  duration: number;
  lane: number;
  lane_role: number;
  position_est: number;
  rank_tier: number;
  leaderboard_rank: number | null;
  computed_mmr?: number | null;
  is_pro?: boolean;
  is_captain?: boolean;
  is_roaming?: boolean;
  is_subscriber?: boolean;
  is_contributor?: boolean;
  leaver_status?: number;
  party_id?: number;
  party_size?: number;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  backpack_0: number;
  backpack_1: number;
  backpack_2: number;
  item_neutral: number;
  item_neutral2?: number;
  aghanims_scepter: number;
  aghanims_shard: number;
  moonshard?: number;
  tower_kills: number;
  roshan_kills: number;
  courier_kills: number;
  observer_kills: number;
  sentry_kills: number;
  obs_placed: number;
  sen_placed: number;
  camps_stacked: number;
  creeps_stacked: number;
  rune_pickups: number;
  firstblood_claimed: number;
  teamfight_participation?: number;
  actions_per_min?: number;
  lane_efficiency?: number;
  lane_efficiency_pct?: number;
  imp?: number;
  award?: string;
  stratz_metadata?: OpenDotaStratzMetadata;
  benchmarks?: Record<string, OpenDotaBenchmarkValue>;
  ability_upgrades_arr?: number[];
  buyback_log?: OpenDotaBuybackLog[];
  purchase_log?: OpenDotaLogEvent[];
  kills_log?: OpenDotaLogEvent[];
  runes_log?: OpenDotaLogEvent[];
  obs_log?: OpenDotaWardLog[];
  sen_log?: OpenDotaWardLog[];
  obs_left_log?: OpenDotaWardLog[];
  sen_left_log?: OpenDotaWardLog[];
  neutral_item_history?: OpenDotaNeutralItemHistory[];
  permanent_buffs?: OpenDotaPermanentBuff[];
  max_hero_hit?: OpenDotaMaxHeroHit;
  damage_targets?: Record<string, Record<string, number>>;
  damage_inflictor?: Record<string, number>;
  damage_inflictor_received?: Record<string, number>;
  damage_taken?: Record<string, number>;
  damage?: Record<string, number>;
  item_uses?: Record<string, number>;
  item_usage?: Record<string, number>;
  item_win?: Record<string, number>;
  ability_uses?: Record<string, number>;
  ability_targets?: Record<string, Record<string, number>>;
  actions?: Record<string, number>;
  healing?: Record<string, number>;
  killed?: Record<string, number>;
  killed_by?: Record<string, number>;
  kill_streaks?: Record<string, number>;
  multi_kills?: Record<string, number>;
  gold_reasons?: Record<string, number>;
  xp_reasons?: Record<string, number>;
  purchase?: Record<string, number>;
  purchase_time?: Record<string, number>;
  first_purchase_time?: Record<string, number>;
  lh_t?: number[];
  dn_t?: number[];
  gold_t?: number[];
  xp_t?: number[];
  times?: number[];
  hero_damage_t?: number[];
  hero_healing_t?: number[];
  camps_stacked_t?: number[];
  lane_pos?: Record<string, Record<string, number>>;
  [key: string]: unknown;
}

export interface OpenDotaTeamfightPlayer {
  player_slot?: number;
  deaths?: number;
  buybacks?: number;
  damage?: number;
  healing?: number;
  gold_delta?: number;
  goldDelta?: number;
  xp_delta?: number;
  xpDelta?: number;
  ability_uses?: Record<string, number>;
  item_uses?: Record<string, number>;
  killed?: Record<string, number>;
  deaths_pos?: Record<string, number>;
  [key: string]: unknown;
}

export interface OpenDotaTeamfight {
  start?: number;
  startTime?: number;
  end?: number;
  endTime?: number;
  last_death?: number;
  deaths?: number;
  players?: OpenDotaTeamfightPlayer[];
  [key: string]: unknown;
}

export interface OpenDotaObjective {
  time?: number;
  type?: string;
  key?: string | number;
  slot?: number;
  player_slot?: number;
  team?: number | string;
  [key: string]: unknown;
}

export interface OpenDotaData {
  chat?: OpenDotaChatEvent[];
  loss?: number;
  flags?: number;
  patch?: number;
  throw?: number;
  engine?: number;
  league?: OpenDotaLeague;
  pauses?: OpenDotaPause[];
  region?: number;
  source?: string;
  cluster?: number;
  od_data?: OpenDotaOdData;
  players?: OpenDotaPlayer[];
  radiant_win?: boolean;
  duration?: number;
  radiant_score?: number;
  dire_score?: number;
  picks_bans?: OpenDotaPickBan[];
  radiant_gold_adv?: number[];
  radiant_xp_adv?: number[];
  tower_status_radiant?: number;
  tower_status_dire?: number;
  barracks_status_radiant?: number;
  barracks_status_dire?: number;
  teamfights?: OpenDotaTeamfight[];
  objectives?: OpenDotaObjective[];
  [key: string]: unknown;
}

export interface GameSeriesGameItem {
  slug: string;
  game_number: number;
  status: string;
  status_display: string;
  radiant_team_slug?: string | null;
  dire_team_slug?: string | null;
  winner_slug?: string | null;
  duration_seconds?: number | null;
  opendota_match_id?: number | string | null;
  started_at?: string | null;
  ended_at?: string | null;
  is_current?: boolean;
}

export interface GameSeriesInfo {
  slug: string;
  best_of: string;
  best_of_display: string;
  status: string;
  status_display: string;
  score_a: number | null;
  score_b: number | null;
  winner_slug?: string | null;
  team_a_slug: string;
  team_b_slug: string;
  games: GameSeriesGameItem[];
}

export interface GameDetailData {
  slug: string;
  game_number: number;
  series_slug: string;
  series_best_of?: string;
  series_best_of_display?: string;
  stage_slug: string;
  stage_name: string;
  tournament_slug: string;
  tournament_name: string;
  status: string;
  status_display: string;
  opendota_match_id: number | string | null;
  radiant_team: GameTeamData | null;
  dire_team: GameTeamData | null;
  winner_slug: string | null;
  duration_seconds: number | null;
  radiant_picks: number[];
  dire_picks: number[];
  radiant_heroes: GameHeroData[];
  dire_heroes: GameHeroData[];
  started_at: string | null;
  ended_at: string | null;
  opendota_data: OpenDotaData | null;
  radiant_players?: GameRosterPlayer[];
  dire_players?: GameRosterPlayer[];
  opendota_sync_status?: string;
  sync_status_display?: string;
  opendota_last_synced_at?: string | null;
  opendota_sync_error?: string;
  series?: GameSeriesInfo | null;
  series_games?: GameSeriesGameItem[];
  other_game_slugs?: string[];
}

