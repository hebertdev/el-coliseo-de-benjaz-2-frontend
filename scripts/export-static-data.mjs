import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://elcoliseoapi.hebertdev.com/api";
const TOURNAMENT_SLUG = "el-gran-coliseo-ii";
const OUTPUT_DIR = path.resolve(__dirname, "../src/data/static");

async function fetchJSON(endpoint) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  console.log(`[GET] ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "StaticExporter/1.0",
      },
    });
    if (!res.ok) {
      console.warn(`  -> Failed with status ${res.status}: ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`  -> Error fetching ${url}:`, err.message);
    return null;
  }
}

function saveJSON(filePath, data) {
  const fullPath = path.resolve(OUTPUT_DIR, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  ✓ Saved: ${filePath}`);
}

async function main() {
  console.log("=========================================");
  console.log("   EXPORTING COLISEO TOURNAMENT DATA     ");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Tournament: ${TOURNAMENT_SLUG}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log("=========================================\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Fetch Stages
  console.log("--- 1. Fetching Stages ---");
  const swissStage = await fetchJSON(`/stages/fase-suiza/?tournament_slug=${TOURNAMENT_SLUG}`);
  if (swissStage) saveJSON("stages/fase-suiza.json", swissStage);

  const playoffsStage = await fetchJSON(`/stages/playoffs/?tournament_slug=${TOURNAMENT_SLUG}`);
  if (playoffsStage) saveJSON("stages/playoffs.json", playoffsStage);

  const standings = await fetchJSON(`/stages/standings/?tournament_slug=${TOURNAMENT_SLUG}&stage_slug=fase-suiza`);
  if (standings) saveJSON("stages/standings.json", standings);

  // 2. Fetch Analytics & Player of the day
  console.log("\n--- 2. Fetching Analytics & POTD ---");
  const analytics = await fetchJSON(`/tournaments/${TOURNAMENT_SLUG}/analytics/`);
  if (analytics) saveJSON("tournaments/analytics.json", analytics);

  const potd = await fetchJSON(`/tournaments/${TOURNAMENT_SLUG}/player-of-the-day/`);
  if (potd) saveJSON("tournaments/player-of-the-day.json", potd);

  // 3. Fetch Teams
  console.log("\n--- 3. Fetching Teams ---");
  const teamsData = await fetchJSON(`/teams/?tournament_slug=${TOURNAMENT_SLUG}&include_roster=true`);
  if (teamsData) saveJSON("teams/index.json", teamsData);

  const teamsList = Array.isArray(teamsData)
    ? teamsData
    : (teamsData?.results || teamsData?.teams || []);

  const playerSlugs = new Set();
  const gameSlugs = new Set();

  for (const team of teamsList) {
    if (!team.slug) continue;
    console.log(`\nProcessing team: ${team.name} (${team.slug})`);
    
    // Team detail
    const teamDetail = await fetchJSON(`/teams/${team.slug}/`);
    if (teamDetail) saveJSON(`teams/${team.slug}/detail.json`, teamDetail);

    // Team roster
    const teamRoster = await fetchJSON(`/teams/${team.slug}/roster/?tournament_slug=${TOURNAMENT_SLUG}`);
    if (teamRoster) {
      saveJSON(`teams/${team.slug}/roster.json`, teamRoster);
      const members = Array.isArray(teamRoster) ? teamRoster : (teamRoster.roster || []);
      for (const m of members) {
        const pSlug = m.player?.slug || m.player?.nickname || m.slug || m.nickname;
        if (pSlug) playerSlugs.add(pSlug);
      }
    }

    // Team matches
    const teamMatches = await fetchJSON(`/teams/${team.slug}/matches/?tournament_slug=${TOURNAMENT_SLUG}`);
    if (teamMatches) {
      saveJSON(`teams/${team.slug}/matches.json`, teamMatches);
      // Collect game slugs if present
      const series = teamMatches.series || teamMatches.results || (Array.isArray(teamMatches) ? teamMatches : []);
      for (const s of series) {
        if (s.games && Array.isArray(s.games)) {
          for (const g of s.games) {
            if (g.slug) gameSlugs.add(g.slug);
          }
        }
      }
    }

    if (team.roster && Array.isArray(team.roster)) {
      for (const m of team.roster) {
        const pSlug = m.player?.slug || m.player?.nickname || m.slug || m.nickname;
        if (pSlug) playerSlugs.add(pSlug);
      }
    }
  }

  // 4. Fetch Players
  console.log(`\n--- 4. Fetching Players (${playerSlugs.size} found) ---`);
  for (const pSlug of playerSlugs) {
    console.log(`Processing player: ${pSlug}`);
    const playerDetail = await fetchJSON(`/players/${encodeURIComponent(pSlug)}/`);
    if (playerDetail) saveJSON(`players/${pSlug}/detail.json`, playerDetail);

    const playerMatches = await fetchJSON(`/players/${encodeURIComponent(pSlug)}/matches/?tournament_slug=${TOURNAMENT_SLUG}`);
    if (playerMatches) {
      saveJSON(`players/${pSlug}/matches.json`, playerMatches);
      const matches = playerMatches.matches || playerMatches.results || (Array.isArray(playerMatches) ? playerMatches : []);
      for (const m of matches) {
        if (m.game_slug) gameSlugs.add(m.game_slug);
        if (m.game?.slug) gameSlugs.add(m.game.slug);
      }
    }
  }

  // Also extract games from Swiss Stage and Playoffs
  function extractGamesFromStage(stage) {
    if (!stage) return;
    const rounds = stage.rounds || [];
    for (const round of rounds) {
      const matches = round.matches || [];
      for (const match of matches) {
        if (match.games && Array.isArray(match.games)) {
          for (const g of match.games) {
            if (g.slug) gameSlugs.add(g.slug);
          }
        }
      }
    }
    const brackets = stage.brackets || [];
    for (const b of brackets) {
      if (b.matches && Array.isArray(b.matches)) {
        for (const match of b.matches) {
          if (match.games && Array.isArray(match.games)) {
            for (const g of match.games) {
              if (g.slug) gameSlugs.add(g.slug);
            }
          }
        }
      }
    }
  }

  extractGamesFromStage(swissStage);
  extractGamesFromStage(playoffsStage);

  // 5. Fetch Games
  console.log(`\n--- 5. Fetching Games (${gameSlugs.size} found) ---`);
  for (const gSlug of gameSlugs) {
    console.log(`Processing game: ${gSlug}`);
    const gameDetail = await fetchJSON(`/games/${encodeURIComponent(gSlug)}/`);
    if (gameDetail) saveJSON(`games/${gSlug}.json`, gameDetail);
  }

  // 6. Create master index manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    tournamentSlug: TOURNAMENT_SLUG,
    teamsCount: teamsList.length,
    playersCount: playerSlugs.size,
    gamesCount: gameSlugs.size,
    teams: teamsList.map((t) => ({ name: t.name, slug: t.slug })),
    players: Array.from(playerSlugs),
    games: Array.from(gameSlugs),
  };
  saveJSON("manifest.json", manifest);

  console.log("\n=========================================");
  console.log("   DATA EXPORT COMPLETED SUCCESSFULLY!   ");
  console.log("=========================================\n");
}

main().catch(console.error);
