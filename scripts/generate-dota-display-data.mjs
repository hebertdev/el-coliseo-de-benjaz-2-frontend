import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// Keep only display metadata; the full package also contains descriptions,
// patch history and gameplay tables that the browser never uses.
const require = createRequire(import.meta.url);
const buildDir = path.join(path.dirname(require.resolve("dotaconstants")), "build");
const read = (name) => JSON.parse(fs.readFileSync(path.join(buildDir, `${name}.json`), "utf8"));
const displayEntries = (entries) => Object.fromEntries(
  Object.entries(entries).map(([key, value]) => [key, {
    ...(value.dname ? { dname: value.dname } : {}),
    ...(value.img ? { img: value.img } : {}),
  }])
);
const output = {
  item_ids: read("item_ids"),
  ability_ids: read("ability_ids"),
  items: displayEntries(read("items")),
  abilities: displayEntries(read("abilities")),
};
const destination = new URL("../src/data/dota-display.json", import.meta.url);
fs.writeFileSync(destination, `${JSON.stringify(output)}\n`);
console.log(`Generated Dota display metadata: ${fs.statSync(destination).size} bytes`);
