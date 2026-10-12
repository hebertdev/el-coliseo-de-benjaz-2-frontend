import type { GameDetailData } from "interfaces/games";

// Raw replay tables unused by any of the match views. Preserve logs, timelines,
// combat stats and teamfights so every analysis tab retains its original data.
const unusedPlayerFields = new Set([
  "ability_targets", "actions", "connection_log", "cosmetics",
  "damage_targets", "damage_inflictor_received", "damage_taken",
  "first_purchase_time", "gold_reasons", "hero_hits", "item_usage",
  "lane_pos", "life_state", "obs", "purchase", "purchase_time", "sen",
  "xp_reasons",
]);

export function getGameDisplayData(game: GameDetailData): GameDetailData {
  if (!game.opendota_data) return game;

  return {
    ...game,
    opendota_data: {
      ...game.opendota_data,
      players: game.opendota_data.players?.map((player) =>
        Object.fromEntries(
          Object.entries(player).filter(([key]) => !unusedPlayerFields.has(key))
        ) as unknown as typeof player
      ),
    },
  };
}
