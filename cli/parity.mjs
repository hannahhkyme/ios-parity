#!/usr/bin/env node
// parity-studio CLI
//   parity new "<company name or URL>" [--industry clinical|retail|banking|travel|telecom|generic] [--color #RRGGBB]
//   parity ios <slug>       build + XCUITest parity run + walkthrough recording (macOS + Xcode)
//   parity android <slug>   build + Robolectric parity run + walkthrough frames (JDK 17 + Android SDK)
//   parity report <slug>    compare iOS vs Android evidence -> customers/<slug>/parity.json
//   parity run "<company>"  new + ios + android + report
//   parity list
import fs from "node:fs";
import path from "node:path";
import { parseCompanyInput, buildSpec, scrapeSite, slugify } from "./lib/spec.mjs";
import { generateIOS } from "./lib/gen-ios.mjs";
import { generateAndroid } from "./lib/gen-android.mjs";
import { ROOT, customerDir, write, readJSON } from "./lib/util.mjs";

function args(argv) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) { flags[key] = next; i++; } else flags[key] = true;
    } else pos.push(argv[i]);
  }
  return { pos, flags };
}

function log(msg) {
  console.log(`[parity] ${msg}`);
}

function setStatus(slug, patch) {
  const file = path.join(customerDir(slug), "status.json");
  const cur = fs.existsSync(file) ? readJSON(file) : {};
  write(file, JSON.stringify({ ...cur, ...patch, updatedAt: new Date().toISOString() }, null, 2));
}

async function cmdNew(input, flags) {
  const { name, url } = parseCompanyInput(input);
  const site = url && !flags["no-scrape"] ? await scrapeSite(url) : {};
  const spec = buildSpec({ name, url, industry: flags.industry, primary: flags.color, site });
  const dir = customerDir(spec.slug);
  if (fs.existsSync(path.join(dir, "spec.json")) && !flags.force) {
    log(`${spec.slug} already exists (use --force to regenerate the apps)`);
  }
  write(path.join(dir, "spec.json"), JSON.stringify(spec, null, 2));
  generateIOS(spec, dir);
  generateAndroid(spec, dir);
  setStatus(spec.slug, { company: spec.company, generated: true, ios: "pending", android: "pending" });
  log(`generated ${spec.company} (${spec.industry}) -> customers/${spec.slug}`);
  log(`  iOS:     customers/${spec.slug}/ios (${spec.ios.target})`);
  log(`  Android: customers/${spec.slug}/android (${spec.android.packageName})`);
  log(`  ${spec.components.length} components, ${spec.flows.length} flows in the parity contract`);
  return spec.slug;
}

function resolveSlug(value) {
  const slug = fs.existsSync(customerDir(value)) ? value : slugify(parseCompanyInput(value).name);
  if (!fs.existsSync(path.join(customerDir(slug), "spec.json"))) throw new Error(`no customer "${value}" (run: parity new "${value}")`);
  return slug;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { pos, flags } = args(rest);
  switch (cmd) {
    case "new":
      if (!pos[0]) throw new Error('usage: parity new "<company>"');
      await cmdNew(pos.join(" "), flags);
      break;
    case "ios": {
      const slug = resolveSlug(pos[0]);
      setStatus(slug, { ios: "running" });
      const { runIOS } = await import("./lib/run-ios.mjs");
      try { await runIOS(slug, flags); setStatus(slug, { ios: "done" }); } catch (e) { setStatus(slug, { ios: "failed", iosError: String(e.message || e) }); throw e; }
      break;
    }
    case "android": {
      const slug = resolveSlug(pos[0]);
      setStatus(slug, { android: "running" });
      const { runAndroid } = await import("./lib/run-android.mjs");
      try { await runAndroid(slug, flags); setStatus(slug, { android: "done" }); } catch (e) { setStatus(slug, { android: "failed", androidError: String(e.message || e) }); throw e; }
      break;
    }
    case "report": {
      const slug = resolveSlug(pos[0]);
      const { buildReport } = await import("./lib/report.mjs");
      const r = await buildReport(slug);
      log(`parity score ${r.summary.score}% · components ${r.summary.components.pass}/${r.summary.components.total} · flows ${r.summary.flows.parity}/${r.summary.flows.total}`);
      break;
    }
    case "run": {
      const slug = await cmdNew(pos.join(" "), flags);
      const { runIOS } = await import("./lib/run-ios.mjs");
      const { runAndroid } = await import("./lib/run-android.mjs");
      const { buildReport } = await import("./lib/report.mjs");
      for (const [platform, fn] of [["ios", runIOS], ["android", runAndroid]]) {
        setStatus(slug, { [platform]: "running" });
        try { await fn(slug, flags); setStatus(slug, { [platform]: "done" }); }
        catch (e) { setStatus(slug, { [platform]: "failed", [`${platform}Error`]: String(e.message || e) }); log(`${platform} failed: ${e.message}`); }
      }
      const r = await buildReport(slug);
      log(`parity score ${r.summary.score}%`);
      break;
    }
    case "list":
      for (const slug of fs.readdirSync(path.join(ROOT, "customers"))) {
        const f = path.join(customerDir(slug), "spec.json");
        if (fs.existsSync(f)) console.log(`${slug}\t${readJSON(f).company}\t${readJSON(f).industry}`);
      }
      break;
    default:
      console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 9).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  }
}

main().catch((e) => {
  console.error(`[parity] error: ${e.message}`);
  process.exit(1);
});
