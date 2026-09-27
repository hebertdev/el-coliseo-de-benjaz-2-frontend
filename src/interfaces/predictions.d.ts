export interface PodiumTeam {
  slug: string;
  name: string;
  tag: string;
  logo: string | null;
  short_name?: string;
}

export interface UserPodiumPrediction {
  champion: PodiumTeam;
  runner_up: PodiumTeam;
  third_place: PodiumTeam;
  created_at?: string;
  updated_at?: string;
}

export interface PodiumData {
  is_locked: boolean;
  teams: PodiumTeam[];
  user_prediction: UserPodiumPrediction | null;
}

export interface CommunityVoteStats {
  total_votes: number;
  team_a_votes: number;
  team_b_votes: number;
  team_a_percentage: number;
  team_b_percentage: number;
  user_prediction?: {
    predicted_winner_slug: string;
    predicted_winner_name?: string;
    predicted_winner_tag?: string;
    is_correct?: boolean | null;
    points?: number;
  } | null;
}

export interface PlayoffMatchTeam {
  slug: string;
  name: string;
  tag: string;
  logo: string | null;
  score?: number | null;
}

export interface PlayoffHubMatch {
  slug: string;
  identifier: string;
  round_name: string;
  stage_name: string;
  status: string;
  best_of: string;
  scheduled_at: string | null;
  team_a: PlayoffMatchTeam | null;
  team_b: PlayoffMatchTeam | null;
  winner_slug?: string | null;
  community_votes: CommunityVoteStats;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  steam_id?: string | null;
  avatar?: string | null;
  total_points: number;
  total_predictions: number;
  correct_predictions: number;
  win_rate: number;
}

export interface UserPredictionStats {
  username: string;
  steam_id?: string | null;
  total_points: number;
  total_predictions: number;
  correct_predictions: number;
  rank?: number | null;
}

export interface PlayoffHubResponse {
  tournament: {
    slug: string;
    name: string;
  };
  podium: PodiumData;
  matches: PlayoffHubMatch[];
  playoff_bracket?: unknown[];
  third_place_match?: unknown;
  leaderboard: LeaderboardEntry[];
  user_stats: UserPredictionStats | null;
}

export interface SubmitPodiumPayload {
  tournament_slug?: string;
  champion: string;
  runner_up: string;
  third_place: string;
}

export interface SubmitMatchPredictionPayload {
  series_slug: string;
  team_slug: string;
}
