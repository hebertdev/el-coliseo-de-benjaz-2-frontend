// interfaces
import { PlayerDetailData } from "interfaces/players";
import { PlayerMatchHistoryResponse } from "interfaces/matches";

export async function getPlayerBySlugAPI(slugOrNickname: string): Promise<PlayerDetailData> {
  const cleanParam = slugOrNickname.trim().toLowerCase();
  try {
    const mod = await import(`data/static/players/${cleanParam}/detail.json`);
    return (mod.default || mod) as unknown as PlayerDetailData;
  } catch {
    throw new Error(`Player not found: ${slugOrNickname}`);
  }
}

export const getPlayerByNicknameAPI = getPlayerBySlugAPI;

export async function getPlayerMatchesAPI(
  slugOrNickname: string,
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<PlayerMatchHistoryResponse> {
  void _tournamentSlug;
  const cleanParam = slugOrNickname.trim().toLowerCase();
  try {
    const mod = await import(`data/static/players/${cleanParam}/matches.json`);
    return (mod.default || mod) as unknown as PlayerMatchHistoryResponse;
  } catch {
    return { count: 0, matches: [] } as unknown as PlayerMatchHistoryResponse;
  }
}

export { getPlayerOfTheDayAPI } from "./playerOfTheDay";
