import type { PlayerOfTheDayResponse } from "interfaces/playerOfTheDay";
import potdData from "data/static/tournaments/player-of-the-day.json";
import { deepNormalizeMediaUrls } from "lib/config";

export async function getPlayerOfTheDayAPI(
  _tournamentSlug?: string,
  _jornadaId?: string
): Promise<PlayerOfTheDayResponse | null> {
  void _tournamentSlug;
  void _jornadaId;
  if (potdData && (potdData as unknown as PlayerOfTheDayResponse).player_of_the_day) {
    return deepNormalizeMediaUrls(potdData as unknown as PlayerOfTheDayResponse);
  }
  return potdData ? deepNormalizeMediaUrls(potdData as unknown as PlayerOfTheDayResponse) : null;
}
