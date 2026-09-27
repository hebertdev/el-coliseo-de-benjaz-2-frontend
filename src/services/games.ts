import { GameDetailData } from "interfaces/games";
import { SeriesLiveMatchData } from "interfaces/matches";

export async function getGameBySlugAPI(slug: string): Promise<GameDetailData | null> {
  try {
    const mod = await import(`data/static/games/${slug}.json`);
    return (mod.default || mod) as unknown as GameDetailData;
  } catch {
    return null;
  }
}

export const getGameBySlugClientAPI = getGameBySlugAPI;

export async function getSeriesLiveAPI(_seriesSlug: string): Promise<SeriesLiveMatchData | null> {
  void _seriesSlug;
  return null;
}

export async function toggleTournamentPollingAPI(
  _tournamentSlug: string,
  _active?: boolean,
  _leagueId?: number
) {
  void _tournamentSlug;
  void _active;
  void _leagueId;
  return { success: true };
}
