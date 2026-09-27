import { GameDetailData, GameRosterPlayer, OpenDotaPlayer } from "interfaces/games";
import dotaconstants from "dotaconstants";

export const HERO_ID_MAP: Record<number, { shortName: string; name: string }> = {
  1: { shortName: "antimage", name: "Anti-Mage" },
  2: { shortName: "axe", name: "Axe" },
  3: { shortName: "bane", name: "Bane" },
  4: { shortName: "bloodseeker", name: "Bloodseeker" },
  5: { shortName: "crystal_maiden", name: "Crystal Maiden" },
  6: { shortName: "drow_ranger", name: "Drow Ranger" },
  7: { shortName: "earthshaker", name: "Earthshaker" },
  8: { shortName: "juggernaut", name: "Juggernaut" },
  9: { shortName: "mirana", name: "Mirana" },
  10: { shortName: "morphling", name: "Morphling" },
  11: { shortName: "nevermore", name: "Shadow Fiend" },
  12: { shortName: "phantom_lancer", name: "Phantom Lancer" },
  13: { shortName: "puck", name: "Puck" },
  14: { shortName: "pudge", name: "Pudge" },
  15: { shortName: "razor", name: "Razor" },
  16: { shortName: "sand_king", name: "Sand King" },
  17: { shortName: "storm_spirit", name: "Storm Spirit" },
  18: { shortName: "sven", name: "Sven" },
  19: { shortName: "tiny", name: "Tiny" },
  20: { shortName: "vengefulspirit", name: "Vengeful Spirit" },
  21: { shortName: "windrunner", name: "Windranger" },
  22: { shortName: "zuus", name: "Zeus" },
  23: { shortName: "kunkka", name: "Kunkka" },
  25: { shortName: "lina", name: "Lina" },
  26: { shortName: "lion", name: "Lion" },
  27: { shortName: "shadow_shaman", name: "Shadow Shaman" },
  28: { shortName: "slardar", name: "Slardar" },
  29: { shortName: "tidehunter", name: "Tidehunter" },
  30: { shortName: "witch_doctor", name: "Witch Doctor" },
  31: { shortName: "lich", name: "Lich" },
  32: { shortName: "riki", name: "Riki" },
  33: { shortName: "enigma", name: "Enigma" },
  34: { shortName: "tinker", name: "Tinker" },
  35: { shortName: "sniper", name: "Sniper" },
  36: { shortName: "necrolyte", name: "Necrophos" },
  37: { shortName: "warlock", name: "Warlock" },
  38: { shortName: "beastmaster", name: "Beastmaster" },
  39: { shortName: "queenofpain", name: "Queen of Pain" },
  40: { shortName: "venomancer", name: "Venomancer" },
  41: { shortName: "faceless_void", name: "Faceless Void" },
  42: { shortName: "skeleton_king", name: "Wraith King" },
  43: { shortName: "death_prophet", name: "Death Prophet" },
  44: { shortName: "phantom_assassin", name: "Phantom Assassin" },
  45: { shortName: "pugna", name: "Pugna" },
  46: { shortName: "templar_assassin", name: "Templar Assassin" },
  47: { shortName: "viper", name: "Viper" },
  48: { shortName: "luna", name: "Luna" },
  49: { shortName: "dragon_knight", name: "Dragon Knight" },
  50: { shortName: "dazzle", name: "Dazzle" },
  51: { shortName: "rattletrap", name: "Clockwerk" },
  52: { shortName: "leshrac", name: "Leshrac" },
  53: { shortName: "furion", name: "Nature's Prophet" },
  54: { shortName: "life_stealer", name: "Lifestealer" },
  55: { shortName: "dark_seer", name: "Dark Seer" },
  56: { shortName: "clinkz", name: "Clinkz" },
  57: { shortName: "omniknight", name: "Omniknight" },
  58: { shortName: "enchantress", name: "Enchantress" },
  59: { shortName: "huskar", name: "Huskar" },
  60: { shortName: "night_stalker", name: "Night Stalker" },
  61: { shortName: "broodmother", name: "Broodmother" },
  62: { shortName: "bounty_hunter", name: "Bounty Hunter" },
  63: { shortName: "weaver", name: "Weaver" },
  64: { shortName: "jakiro", name: "Jakiro" },
  65: { shortName: "batrider", name: "Batrider" },
  66: { shortName: "chen", name: "Chen" },
  67: { shortName: "spectre", name: "Spectre" },
  68: { shortName: "ancient_apparition", name: "Ancient Apparition" },
  69: { shortName: "doom_bringer", name: "Doom" },
  70: { shortName: "ursa", name: "Ursa" },
  71: { shortName: "spirit_breaker", name: "Spirit Breaker" },
  72: { shortName: "gyrocopter", name: "Gyrocopter" },
  73: { shortName: "alchemist", name: "Alchemist" },
  74: { shortName: "invoker", name: "Invoker" },
  75: { shortName: "silencer", name: "Silencer" },
  76: { shortName: "obsidian_destroyer", name: "Outworld Destroyer" },
  77: { shortName: "lycan", name: "Lycan" },
  78: { shortName: "brewmaster", name: "Brewmaster" },
  79: { shortName: "shadow_demon", name: "Shadow Demon" },
  80: { shortName: "lone_druid", name: "Lone Druid" },
  81: { shortName: "chaos_knight", name: "Chaos Knight" },
  82: { shortName: "meepo", name: "Meepo" },
  83: { shortName: "treant", name: "Treant Protector" },
  84: { shortName: "ogre_magi", name: "Ogre Magi" },
  85: { shortName: "undying", name: "Undying" },
  86: { shortName: "rubick", name: "Rubick" },
  87: { shortName: "disruptor", name: "Disruptor" },
  88: { shortName: "nyx_assassin", name: "Nyx Assassin" },
  89: { shortName: "naga_siren", name: "Naga Siren" },
  90: { shortName: "keeper_of_the_light", name: "Keeper of the Light" },
  91: { shortName: "wisp", name: "Io" },
  92: { shortName: "visage", name: "Visage" },
  93: { shortName: "slark", name: "Slark" },
  94: { shortName: "medusa", name: "Medusa" },
  95: { shortName: "troll_warlord", name: "Troll Warlord" },
  96: { shortName: "centaur", name: "Centaur Warrunner" },
  97: { shortName: "magnataur", name: "Magnus" },
  98: { shortName: "shredder", name: "Timbersaw" },
  99: { shortName: "bristleback", name: "Bristleback" },
  100: { shortName: "tusk", name: "Tusk" },
  101: { shortName: "skywrath_mage", name: "Skywrath Mage" },
  102: { shortName: "abaddon", name: "Abaddon" },
  103: { shortName: "elder_titan", name: "Elder Titan" },
  104: { shortName: "legion_commander", name: "Legion Commander" },
  105: { shortName: "techies", name: "Techies" },
  106: { shortName: "ember_spirit", name: "Ember Spirit" },
  107: { shortName: "earth_spirit", name: "Earth Spirit" },
  108: { shortName: "abyssal_underlord", name: "Underlord" },
  109: { shortName: "terrorblade", name: "Terrorblade" },
  110: { shortName: "phoenix", name: "Phoenix" },
  111: { shortName: "oracle", name: "Oracle" },
  112: { shortName: "winter_wyvern", name: "Winter Wyvern" },
  113: { shortName: "arc_warden", name: "Arc Warden" },
  114: { shortName: "monkey_king", name: "Monkey King" },
  119: { shortName: "dark_willow", name: "Dark Willow" },
  120: { shortName: "pangolier", name: "Pangolier" },
  121: { shortName: "grimstroke", name: "Grimstroke" },
  123: { shortName: "hoodwink", name: "Hoodwink" },
  126: { shortName: "void_spirit", name: "Void Spirit" },
  128: { shortName: "snapfire", name: "Snapfire" },
  129: { shortName: "mars", name: "Mars" },
  131: { shortName: "ringmaster", name: "Ringmaster" },
  135: { shortName: "dawnbreaker", name: "Dawnbreaker" },
  136: { shortName: "marci", name: "Marci" },
  137: { shortName: "primal_beast", name: "Primal Beast" },
  138: { shortName: "muerta", name: "Muerta" },
  145: { shortName: "kez", name: "Kez" },
};

export const DOTA_ITEMS_MAP: Record<number, string> = {
  1: "blink",
  16: "branches",
  19: "robe",
  30: "bottle",
  34: "magic_stick",
  36: "magic_wand",
  37: "ghost",
  40: "dust",
  41: "bottle",
  42: "ward_observer",
  43: "boots",
  44: "tango",
  45: "courier",
  46: "tpscroll",
  48: "travel_boots",
  50: "phase_boots",
  63: "power_treads",
  73: "bracer",
  75: "wraith_band",
  77: "null_talisman",
  92: "urn_of_shadows",
  96: "sheepstick",
  102: "force_staff",
  104: "dagon",
  108: "ultimate_scepter",
  110: "refresher",
  112: "assault",
  114: "heart",
  116: "black_king_bar",
  119: "shivas_guard",
  121: "bloodstone",
  123: "sphere",
  125: "vanguard",
  127: "blade_mail",
  135: "monkey_king_bar",
  137: "radiance",
  139: "butterfly",
  141: "greater_crit",
  143: "basher",
  145: "bfury",
  147: "manta",
  149: "lesser_crit",
  151: "armlet",
  152: "invis_sword",
  154: "sange_and_yasha",
  156: "satanic",
  158: "mjollnir",
  160: "skadi",
  162: "sange",
  164: "helm_of_the_dominator",
  166: "maelstrom",
  168: "desolator",
  170: "yasha",
  172: "mask_of_madness",
  174: "diffusal_blade",
  176: "ethereal_blade",
  178: "soul_ring",
  180: "arcane_boots",
  181: "orb_of_venom",
  185: "ancient_janggo",
  188: "smoke_of_deceit",
  190: "veil_of_discord",
  206: "rod_of_atos",
  208: "abyssal_blade",
  210: "heavens_halberd",
  218: "tranquil_boots",
  220: "travel_boots_2",
  223: "meteor_hammer",
  225: "nullifier",
  226: "lotus_orb",
  229: "solar_crest",
  231: "guardian_greaves",
  232: "aether_lens",
  235: "octarine_core",
  236: "dragon_lance",
  240: "blight_stone",
  242: "crimson_guard",
  244: "wind_waker",
  247: "moon_shard",
  249: "silver_edge",
  250: "bloodthorn",
  252: "echo_sabre",
  254: "glimmer_cape",
  256: "aeon_disk",
  259: "kaya",
  263: "hurricane_pike",
  267: "spirit_vessel",
  271: "holy_locket",
  273: "kaya_and_sange",
  274: "yasha_and_kaya",
  277: "bloodstone",
  279: "ring_of_tarrasque",
  288: "cornucopia",
  301: "helm_of_the_overlord",
  307: "witch_blade",
  310: "gungir",
  317: "mage_slayer",
  328: "falcon_blade",
  330: "orb_of_corrosion",
  596: "water_drop",
  598: "wind_lace",
  600: "blitz_knuckles",
  603: "mask_of_madness",
  604: "helm_of_iron_will",
  609: "aghanims_shard",
  637: "voodoo_mask",
  640: "gungir",
  653: "samurai_tabi",
  655: "hermes_sandals",
  930: "revenants_brooch",
  931: "boots_of_bearing",
  938: "wraith_pact",
  1097: "eternal_shroud",
  1122: "diadem",
  1123: "phylactery",
  1124: "harpoon",
  1125: "disperser",
  1128: "khanda",
  1154: "tiara_of_selemene",
};

export const BUFF_IMAGES = {
  scepter: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ultimate_scepter.png",
  shard: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aghanims_shard.png",
  moonshard: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/moon_shard.png",
};

export function getHeroShortName(heroId?: number | null, heroName?: string | null): string {
  if (heroId && HERO_ID_MAP[heroId]) {
    return HERO_ID_MAP[heroId].shortName;
  }
  if (heroName) {
    const clean = heroName.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    if (clean === "anti_mage" || clean === "antimage") return "antimage";
    if (clean === "shadow_fiend") return "nevermore";
    return clean;
  }
  return "spectre";
}

export function getHeroDisplayName(heroId?: number | null, fallbackName?: string | null): string {
  if (heroId && HERO_ID_MAP[heroId]) {
    return HERO_ID_MAP[heroId].name;
  }
  return fallbackName || "Héroe";
}

export function getHeroVideoUrl(shortName: string): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${shortName}.webm`;
}

export function getHeroIconUrl(heroId?: number | null, heroName?: string | null): string {
  const shortName = getHeroShortName(heroId, heroName);
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${shortName}.png`;
}

/**
 * Obtiene la URL oficial de la imagen de un item de Dota 2 desde el CDN de Steam/Cloudflare.
 * Soporta IDs numéricos (resueltos mediante dotaconstants), strings numéricos y claves de items ("psychic_headband").
 */
export function getItemImageUrl(itemIdOrKey?: number | string | null): string {
  if (itemIdOrKey == null || itemIdOrKey === "" || itemIdOrKey === 0 || itemIdOrKey === "0") {
    return "";
  }

  const itemIdsMap = (dotaconstants?.item_ids || {}) as Record<string | number, string>;
  let key: string | undefined;
  const numId = typeof itemIdOrKey === "number" ? itemIdOrKey : Number(itemIdOrKey);

  if (!isNaN(numId) && numId > 0) {
    key = itemIdsMap[numId] || DOTA_ITEMS_MAP[numId];
  } else if (typeof itemIdOrKey === "string") {
    const parsedNum = Number(itemIdOrKey);
    if (!isNaN(parsedNum) && parsedNum > 0 && itemIdsMap[parsedNum]) {
      key = itemIdsMap[parsedNum];
    } else {
      key = itemIdOrKey;
    }
  }

  if (!key) {
    return "";
  }

  // Limpiar prefijo "item_" si viene de las constantes del juego
  const cleanKey = key.replace(/^item_/, "");

  // Si es una receta, usar el asset universal de receta de Steam
  if (cleanKey === "recipe" || cleanKey.startsWith("recipe_")) {
    return "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png";
  }

  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${cleanKey}.png`;
}

/**
 * Obtiene el nombre legible de un item de Dota 2 (ej: "Psychic Headband", "Black King Bar").
 */
export function getItemDisplayName(itemIdOrKey?: number | string | null): string {
  if (itemIdOrKey == null || itemIdOrKey === "" || itemIdOrKey === 0 || itemIdOrKey === "0") {
    return "Item";
  }

  const itemIdsMap = (dotaconstants?.item_ids || {}) as Record<string | number, string>;
  const itemsMap = (dotaconstants?.items || {}) as Record<string, { dname?: string }>;

  let key: string | undefined;
  const numId = typeof itemIdOrKey === "number" ? itemIdOrKey : Number(itemIdOrKey);

  if (!isNaN(numId) && numId > 0) {
    key = itemIdsMap[numId] || DOTA_ITEMS_MAP[numId];
  } else if (typeof itemIdOrKey === "string") {
    const parsedNum = Number(itemIdOrKey);
    if (!isNaN(parsedNum) && parsedNum > 0 && itemIdsMap[parsedNum]) {
      key = itemIdsMap[parsedNum];
    } else {
      key = itemIdOrKey;
    }
  }

  if (!key) return "Item";
  const cleanKey = key.replace(/^item_/, "");
  const detail = itemsMap[cleanKey];
  if (detail?.dname) {
    return detail.dname;
  }
  return cleanKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Obtiene la clave o ID del neutral item actual del jugador.
 * Recorre el historial de neutrales desde el más reciente hacia el más antiguo
 * buscando la última entrada con item_neutral válido, y como fallback usa
 * player.item_neutral o player.item_neutral2.
 */
export function getPlayerNeutralItem(player?: OpenDotaPlayer | null): string | number | undefined {
  if (!player) return undefined;
  const history = player.neutral_item_history || [];
  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i]?.item_neutral;
    if (item) return item;
  }
  if (player.item_neutral && player.item_neutral > 0) {
    return player.item_neutral;
  }
  if (player.item_neutral2 && player.item_neutral2 > 0) {
    return player.item_neutral2;
  }
  return undefined;
}

/**
 * Encuentra el jugador del roster del torneo (GameRosterPlayer) correspondiente
 * a un jugador de OpenDota a través de account_id, steam_id, o posición.
 */
export function matchRosterPlayer(
  player?: OpenDotaPlayer | null,
  game?: GameDetailData | null
): GameRosterPlayer | undefined {
  if (!player || !game) return undefined;

  // Recopilar todos los jugadores de roster disponibles sin duplicados
  const rosterMap = new Map<string, GameRosterPlayer>();
  const candidates: GameRosterPlayer[] = [
    ...(game.radiant_players || []),
    ...(game.dire_players || []),
    ...(game.radiant_team?.players || []),
    ...(game.dire_team?.players || []),
  ];

  candidates.forEach((p) => {
    if (p && p.slug && !rosterMap.has(p.slug)) {
      rosterMap.set(p.slug, p);
    }
  });

  const rosters = Array.from(rosterMap.values());
  if (rosters.length === 0) return undefined;

  // 1. Matchear por account_id (32-bit ID)
  if (player.account_id != null) {
    const targetAccountId = Number(player.account_id);
    const byAccountId = rosters.find(
      (r) => r.account_id != null && Number(r.account_id) === targetAccountId
    );
    if (byAccountId) return byAccountId;

    // Convertir de 32-bit account_id a 64-bit Steam ID: steam64 = account_id + 76561197960265728
    try {
      const steam64 = (BigInt(targetAccountId) + BigInt("76561197960265728")).toString();
      const bySteamId = rosters.find((r) => r.steam_id && r.steam_id === steam64);
      if (bySteamId) return bySteamId;
    } catch {
      // ignore
    }
  }

  // 2. Matchear por personaname / name contra el nickname o slug
  const pName = (player.personaname || player.name || "").toLowerCase().trim();
  if (pName) {
    const byName = rosters.find(
      (r) =>
        (r.nickname && r.nickname.toLowerCase().trim() === pName) ||
        (r.slug && r.slug.toLowerCase().trim() === pName)
    );
    if (byName) return byName;
  }

  // 3. Matchear por bando y slot en el equipo
  const isRadiant = player.isRadiant ?? (player.player_slot != null && player.player_slot < 128);
  const teamRoster = isRadiant
    ? game.radiant_players || game.radiant_team?.players
    : game.dire_players || game.dire_team?.players;

  if (teamRoster && teamRoster.length > 0 && player.player_slot != null) {
    const slotIdx = player.player_slot < 128 ? player.player_slot : player.player_slot - 128;
    if (teamRoster[slotIdx]) {
      return teamRoster[slotIdx];
    }
  }

  return undefined;
}

/**
 * Obtiene el nickname oficial del jugador del evento (GameRosterPlayer).
 * Si no está en el roster, hace fallback a personaname de OpenDota / Steam.
 */
export function getPlayerNickname(
  player?: OpenDotaPlayer | null,
  game?: GameDetailData | null,
  fallback?: string
): string {
  const rosterPlayer = matchRosterPlayer(player, game);
  if (rosterPlayer?.nickname) {
    return rosterPlayer.nickname;
  }
  return player?.personaname || player?.name || fallback || "Jugador";
}

/**
 * Obtiene la URL de imagen horizontal del héroe (banner de Dota 2).
 */
export function getHeroHorizontalImageUrl(
  heroId?: number | null,
  heroName?: string | null
): string {
  const shortName = getHeroShortName(heroId, heroName);
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`;
}

/**
 * Obtiene la medalla de rango de Dota 2 según rank_tier (OpenDota / Stratz).
 */
export function getRankMedalUrl(rankTier?: number | null): string {
  if (!rankTier) {
    return "https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_0.png";
  }
  const tier = Math.floor(rankTier / 10);
  const clamped = Math.min(8, Math.max(1, tier));
  return `https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${clamped}.png`;
}

/**
 * Formatea valores numéricos grandes con sufijo en español (ej: 33.9mil o 1.4M).
 */
export function formatSpanishCompact(val?: number | null): string {
  if (val == null || isNaN(val)) return "0";
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(1).replace(".", ",")}M`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1).replace(".", ",")}mil`;
  }
  return val.toLocaleString("es-ES");
}

export interface AbilityInfo {
  id: number;
  name: string;
  displayName: string;
  isTalent: boolean;
  imgUrl?: string;
}

/**
 * Obtiene los detalles de una habilidad o talento de Dota 2 a partir de su ID numérico.
 */
export function getAbilityInfo(abilityId: number): AbilityInfo {
  const name = dotaconstants?.ability_ids?.[abilityId];
  if (!name) {
    return {
      id: abilityId,
      name: `ability_${abilityId}`,
      displayName: `Habilidad ${abilityId}`,
      isTalent: false,
    };
  }

  const isTalent = name.startsWith("special_bonus_");
  const abilityDetail = dotaconstants?.abilities?.[name];

  let displayName = abilityDetail?.dname || name.replace(/^special_bonus_/, "").replace(/_/g, " ");
  displayName = displayName.replace(/\{s:[^}]+\}/g, "").trim();

  let imgUrl: string | undefined;
  if (!isTalent) {
    imgUrl = abilityDetail?.img
      ? `https://cdn.cloudflare.steamstatic.com${abilityDetail.img}`
      : `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/${name}.png`;
  }

  return {
    id: abilityId,
    name,
    displayName,
    isTalent,
    imgUrl,
  };
}

/**
 * Desglose detallado del cálculo de puntuación MVP.
 */
export interface MvpScoreBreakdown {
  totalScore: number;
  kdaScore: number;
  teamfightScore: number;
  utilityScore: number;
  impactScore: number;
  stats: {
    kda: string;
    teamfightPct: number;
    stuns: number;
    wards: number;
    heroDamage: number;
    towerDamage: number;
    heroHealing: number;
    campsStacked: number;
  };
}

/**
 * Calcula el puntaje de MVP de un jugador de Dota 2 basándose en métricas equilibradas
 * tanto para Cores como para Supports (KDA ponderado, Teamfight, Utilidad e Impacto).
 */
export function calculatePlayerMvpScore(player?: OpenDotaPlayer | null): MvpScoreBreakdown {
  if (!player) {
    return {
      totalScore: 0,
      kdaScore: 0,
      teamfightScore: 0,
      utilityScore: 0,
      impactScore: 0,
      stats: {
        kda: "0/0/0",
        teamfightPct: 0,
        stuns: 0,
        wards: 0,
        heroDamage: 0,
        towerDamage: 0,
        heroHealing: 0,
        campsStacked: 0,
      },
    };
  }

  // 1. Extraer métricas crudas
  const kills = player.kills || 0;
  const deaths = player.deaths || 0;
  const assists = player.assists || 0;
  const tf = player.teamfight_participation || 0;
  const stuns = player.stuns || 0;
  const wardsPlaced = (player.obs_placed || 0) + (player.sen_placed || 0);
  const towerDamage = player.tower_damage || 0;
  const heroDamage = player.hero_damage || 0;
  const heroHealing = player.hero_healing || 0;
  const campsStacked = player.camps_stacked || 0;

  // 2. Pesos de puntuación calibrados
  // - KDA: Recompensa asesinatos y asistencias, penaliza muertes
  const kdaScore = kills * 1.5 - deaths * 1.5 + assists * 1.2;

  // - Teamfight: Premia participar en las peleas de equipo (0 a 1) * 25
  const teamfightScore = tf * 25;

  // - Utilidad: Premia aturdimientos, visión, curación y apilamiento de campamentos (clave para supports)
  const utilityScore =
    stuns * 0.15 + wardsPlaced * 0.5 + heroHealing * 0.001 + campsStacked * 1.0;

  // - Impacto: Premia derribar estructuras y daño a héroes (clave para cores y asedio)
  const impactScore = towerDamage * 0.0015 + heroDamage * 0.0005;

  // 3. Suma total
  const totalScore = kdaScore + teamfightScore + utilityScore + impactScore;

  return {
    totalScore: parseFloat(totalScore.toFixed(2)),
    kdaScore: parseFloat(kdaScore.toFixed(2)),
    teamfightScore: parseFloat(teamfightScore.toFixed(2)),
    utilityScore: parseFloat(utilityScore.toFixed(2)),
    impactScore: parseFloat(impactScore.toFixed(2)),
    stats: {
      kda: `${kills}/${deaths}/${assists}`,
      teamfightPct: Math.round(tf * 100),
      stuns: parseFloat(stuns.toFixed(1)),
      wards: wardsPlaced,
      heroDamage,
      towerDamage,
      heroHealing,
      campsStacked,
    },
  };
}

/**
 * Determina el jugador MVP del partido.
 * REGLA ESTRICTA: El MVP DEBE pertenecer siempre al equipo GANADOR del encuentro.
 */
export function getGameMvpPlayer(game?: GameDetailData | null): OpenDotaPlayer | undefined {
  if (!game) return undefined;
  const players = game.opendota_data?.players || [];
  if (players.length === 0) return undefined;

  // 1. Determinar equipo ganador con precisión
  const radiantWon = Boolean(
    (game.winner_slug && game.radiant_team?.slug && game.winner_slug === game.radiant_team.slug) ||
    game.opendota_data?.radiant_win === true
  );

  // 2. Filtrar candidatos única y exclusivamente del equipo GANADOR
  const winningTeamPlayers = players.filter((p) => {
    const isRad = p.isRadiant !== undefined ? p.isRadiant : (p.player_slot != null && p.player_slot < 128);
    return radiantWon ? isRad : !isRad;
  });

  const candidates = winningTeamPlayers.length > 0 ? winningTeamPlayers : players;

  // 3. Buscar si hay MVP explícito dentro del equipo ganador asignado por Stratz / Valve
  const explicitMvp = candidates.find(
    (p) => p.award === "MVP" || p.stratz_metadata?.award === "MVP"
  );
  if (explicitMvp) return explicitMvp;

  // 4. Si no, calcular el de mayor puntaje integral equilibrado (KDA + Teamfight + Utilidad + Impacto)
  return [...candidates].sort((a, b) => {
    const scoreA = calculatePlayerMvpScore(a).totalScore;
    const scoreB = calculatePlayerMvpScore(b).totalScore;
    return scoreB - scoreA;
  })[0];
}

/**
 * Extrae los items equipados en el Oso Espiritual (Spirit Bear) de Lone Druid si están disponibles en la partida.
 */
export function getPlayerBearItems(player?: OpenDotaPlayer | null): (number | undefined)[] | null {
  if (!player || !player.additional_units || !Array.isArray(player.additional_units)) {
    return null;
  }

  const bearUnit = player.additional_units.find(
    (u) =>
      u.unitname === "spirit_bear" ||
      u.unitname?.toLowerCase().includes("bear")
  );

  if (!bearUnit) return null;

  const items = [
    bearUnit.item_0,
    bearUnit.item_1,
    bearUnit.item_2,
    bearUnit.item_3,
    bearUnit.item_4,
    bearUnit.item_5,
  ];

  const hasAnyItem = items.some((it) => it != null && it > 0);
  if (!hasAnyItem) return null;

  return items;
}


