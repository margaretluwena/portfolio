#!/usr/bin/env node
/*
  Em-dash gate: fails on any U+2014 in shipped code and content.
  Standing rule: zero em dashes anywhere on the site. Runs before every
  production build and on demand via `npm run lint:dashes`.
  En dashes (U+2013) and curly quotes are out of scope on purpose.
*/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "lib", "docs/content"];
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".mdx", ".json", ".svg"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "docs/reference"]);

const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (SKIP_DIRS.has(name) || SKIP_DIRS.has(path)) continue;
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (EXTS.has(extname(name))) {
      const lines = readFileSync(path, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (line.includes("—")) hits.push(`${path}:${i + 1}: ${line.trim().slice(0, 100)}`);
      });
    }
  }
}

for (const root of ROOTS) {
  try {
    walk(root);
  } catch {
    /* missing root is fine */
  }
}

if (hits.length > 0) {
  console.error(`\nEm dashes (U+2014) found in ${hits.length} place(s) - the site ships none:\n`);
  for (const hit of hits) console.error(`  ${hit}`);
  console.error("\nRewrite them (colon, comma, or full stop by judgment), then rebuild.\n");
  process.exit(1);
}

console.log("lint:dashes - no em dashes found.");
