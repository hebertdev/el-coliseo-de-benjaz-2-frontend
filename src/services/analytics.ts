import type { TournamentAnalyticsResponse } from "interfaces/analytics";
import analyticsData from "data/static/tournaments/analytics.json";
import { deepNormalizeMediaUrls } from "lib/config";

export async function getTournamentAnalyticsAPI(
  _tournamentSlug?: string
): Promise<TournamentAnalyticsResponse> {
  void _tournamentSlug;
  return deepNormalizeMediaUrls(analyticsData as unknown as TournamentAnalyticsResponse);
}
