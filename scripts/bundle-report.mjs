import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * First-load JS per route, gzipped, with a ceiling.
 *
 * Not the plan's 60 kB target — that was never reachable. React 19 plus the
 * Next 15 App Router runtime is ~100 kB gzipped before this site's own code
 * exists, so the number was a target for a different architecture. The site is
 * deliberately animation-rich, and the owner has dropped the figure.
 *
 * What is worth guarding is *change*. The ceiling below sits a little above the
 * current home route, so the ordinary cost of the framework passes silently
 * while accidentally pulling in a charting or date library fails loudly.
 */
const CEILING_KB = { "/page": 175, "/work/[slug]/page": 140 };

const manifest = JSON.parse(readFileSync(".next/app-build-manifest.json", "utf8"));
const rows = [];
let failed = false;

for (const [route, files] of Object.entries(manifest.pages)) {
  const js = files.filter((f) => f.endsWith(".js"));
  let gzip = 0;
  for (const file of js) gzip += gzipSync(readFileSync(join(".next", file))).length;

  const kb = gzip / 1024;
  const ceiling = CEILING_KB[route];
  const over = ceiling !== undefined && kb > ceiling;
  if (over) failed = true;

  rows.push(
    `${over ? "FAIL" : "ok  "} ${route.padEnd(36)} ${kb.toFixed(1).padStart(7)} kB gzip` +
      (ceiling === undefined ? "" : `   (ceiling ${ceiling} kB)`),
  );
}

console.log(rows.sort().join("\n"));

if (failed) {
  console.error(
    "\nA route exceeded its first-load ceiling. If the growth is deliberate, raise the\n" +
      "ceiling in scripts/bundle-report.mjs in the same commit, so the increase is\n" +
      "reviewed rather than absorbed.",
  );
  process.exit(1);
}
