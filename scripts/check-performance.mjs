import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const readJSON = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const loadTS = (file) => {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const loaded = { exports: {} };
  new Function("exports", "module", source)(loaded.exports, loaded);
  return loaded.exports;
};
const { getGameDisplayData } = loadTS("src/lib/game-display-data.ts");
let originalBytes = 0;
let displayBytes = 0;
const gameDir = path.join(root, "src/data/static/games");
const files = fs.readdirSync(gameDir).filter((file) => file.endsWith(".json"));
for (const file of files) {
  const game = readJSON(path.join(gameDir, file));
  const original = JSON.stringify(game);
  const result = getGameDisplayData(game);
  assert.equal(JSON.stringify(game), original, `${file}: backup mutated`);
  for (const key of Object.keys(game).filter((key) => key !== "opendota_data")) {
    assert.deepEqual(result[key], game[key], `${file}: match metadata changed`);
  }
  if (game.opendota_data) {
    for (const key of Object.keys(game.opendota_data).filter((key) => key !== "players")) {
      assert.deepEqual(result.opendota_data[key], game.opendota_data[key], `${file}: replay data changed`);
    }
    assert.equal(result.opendota_data.players.length, game.opendota_data.players.length);
    for (const [index, player] of result.opendota_data.players.entries()) {
      for (const key of Object.keys(player)) {
        assert.deepEqual(player[key], game.opendota_data.players[index][key]);
      }
      for (const key of ["kills", "deaths", "assists", "hero_id", "gold_t", "xp_t", "purchase_log", "obs_log", "sen_log", "kills_log", "ability_upgrades_arr", "item_uses"]) {
        assert.deepEqual(player[key], game.opendota_data.players[index][key], `${file}: ${key} removed`);
      }
    }
  }
  originalBytes += Buffer.byteLength(original);
  displayBytes += Buffer.byteLength(JSON.stringify(result));
}
assert.ok(displayBytes < originalBytes * 0.75, "Replay payload reduction regressed");

const require = createRequire(import.meta.url);
const buildDir = path.join(path.dirname(require.resolve("dotaconstants")), "build");
const display = readJSON(path.join(root, "src/data/dota-display.json"));
for (const name of ["item_ids", "ability_ids"]) {
  assert.deepEqual(display[name], readJSON(path.join(buildDir, `${name}.json`)));
}
for (const name of ["items", "abilities"]) {
  const full = readJSON(path.join(buildDir, `${name}.json`));
  assert.deepEqual(Object.keys(display[name]), Object.keys(full));
  for (const [key, value] of Object.entries(full)) {
    assert.equal(display[name][key].dname, value.dname || undefined);
    assert.equal(display[name][key].img, value.img || undefined);
  }
}
console.log(`Verified ${files.length} replays: ${Math.round((1 - displayBytes / originalBytes) * 100)}% smaller payloads; all display names, IDs and images preserved.`);

// Optional checks against a running production server, never the dev server.
// Usage: pnpm test:performance http://localhost:3001
const origin = process.argv[2];
if (origin) {
  const manifest = readJSON(path.join(root, "src/data/static/manifest.json"));
  const routes = [
    "/", "/analytics", "/teams", "/players", "/swiss-stage", "/predictions",
    ...manifest.teams.map((team) => `/teams/${team.slug}`),
    ...manifest.players.map((slug) => `/players/${slug}`),
    ...manifest.games.map((slug) => `/game/${slug}`),
  ];
  let nextRoute = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (nextRoute < routes.length) {
      const route = routes[nextRoute++];
      const response = await fetch(new URL(route, origin));
      assert.equal(response.status, 200, `${route}: page failed`);
      assert.ok(response.headers.get("cache-control")?.includes("s-maxage="), `${route}: shared page caching missing`);
      await response.arrayBuffer();
    }
  }));

  const response = await fetch(new URL("/media/teams/logos/rising-rage.webp", origin));
  assert.equal(response.status, 200);
  assert.ok(response.headers.get("content-type")?.startsWith("image/"));
  assert.ok(response.headers.get("cache-control")?.includes("max-age=86400"));
  assert.ok(response.headers.get("cache-control")?.includes("stale-while-revalidate=604800"));
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), fs.readFileSync(path.join(root, "public/media/teams/logos/rising-rage.webp")));

  const home = await (await fetch(new URL("/", origin))).text();
  const scriptPath = home.match(/src="([^" ]*\/_next\/static\/[^" ]+\.js)"/)?.[1];
  assert.ok(scriptPath, "No production JavaScript found");
  const script = await fetch(new URL(scriptPath, origin));
  assert.equal(script.status, 200);
  assert.ok(script.headers.get("cache-control")?.includes("immutable"));
  await script.arrayBuffer();
  const imagePath = home.match(/src="([^" ]*\/_next\/image\?[^" ]+)"/)?.[1];
  assert.ok(imagePath, "Hero image is not optimized");
  const hero = await fetch(new URL(imagePath.replaceAll("&amp;", "&"), origin));
  assert.equal(hero.status, 200, "Hero image optimization failed");
  assert.ok(hero.headers.get("content-type")?.startsWith("image/"));
  await hero.arrayBuffer();
  console.log(`Verified ${routes.length} public pages, media caching, immutable JavaScript and optimized hero image on ${origin}.`);
}
