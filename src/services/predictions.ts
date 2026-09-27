import type {
  PlayoffHubResponse,
  SubmitPodiumPayload,
  SubmitMatchPredictionPayload,
  LeaderboardEntry,
  CommunityVoteStats,
} from "interfaces/predictions";
import hubData from "data/static/tournaments/predictions-hub.json";
import lbData from "data/static/tournaments/leaderboard.json";
import { deepNormalizeMediaUrls } from "lib/config";

export async function getPlayoffHubAPI(
  _tournamentSlug: string = "el-gran-coliseo-ii",
  _isAuthed: boolean = false
): Promise<PlayoffHubResponse | null> {
  void _tournamentSlug;
  void _isAuthed;
  return hubData ? deepNormalizeMediaUrls(hubData as unknown as PlayoffHubResponse) : null;
}

export async function submitPodiumPredictionAPI(
  _payload: SubmitPodiumPayload
): Promise<{ message: string; podium?: unknown } | { error: string }> {
  void _payload;
  return { message: "El torneo ha finalizado. Las predicciones están cerradas." };
}

export async function submitSeriesPredictionAPI(
  _payload: SubmitMatchPredictionPayload
): Promise<{ message: string; community_votes?: CommunityVoteStats; series_slug?: string } | { error: string }> {
  void _payload;
  return { error: "El torneo ha finalizado. Las predicciones están cerradas." };
}

export async function getLeaderboardAPI(_limit: number = 10): Promise<LeaderboardEntry[]> {
  void _limit;
  const data = lbData as unknown as { leaderboard: LeaderboardEntry[] };
  return data?.leaderboard ? deepNormalizeMediaUrls(data.leaderboard) : [];
}
