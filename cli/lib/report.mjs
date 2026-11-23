import fs from "node:fs";
import path from "node:path";
import { customerDir, readJSON, write } from "./util.mjs";

// Size tolerance between an iOS point and an Android dp rendering of the same
// component, relative to the screen width / height.
const GEOMETRY_TOLERANCE = 0.12;
const VALUE_KINDS = new Set(["Chip", "ToggleRow"]);

const load = (f) => (fs.existsSync(f) ? readJSON(f) : null);
const rel = (slug, platform, p) => (p ? `${platform}/${p}` : null);

function check(ios, android, expected) {
  const ok = ios !== undefined && android !== undefined && ios === android && (expected === undefined || ios === expected);
  return { ios: ios ?? null, android: android ?? null, expected: expected ?? null, ok };
}

function geometry(i, a, di, da) {
  if (!i?.frame || !a?.frame || !di?.width || !da?.width) return { ok: false, delta: null };
  const dw = Math.abs(i.frame.w / di.width - a.frame.w / da.width);
  const dh = Math.abs(i.frame.h / di.height - a.frame.h / da.height);
  const delta = Math.max(dw, dh);
  return {
    ios: { w: Math.round(i.frame.w), h: Math.round(i.frame.h), unit: di.unit },
    android: { w: Math.round(a.frame.w), h: Math.round(a.frame.h), unit: da.unit },
    delta: Math.round(delta * 1000) / 10,
    ok: delta <= GEOMETRY_TOLERANCE,
  };
}

export async function buildReport(slug) {
  const dir = customerDir(slug);
  const spec = readJSON(path.join(dir, "spec.json"));
  const ev = path.join(dir, "evidence");
  const ic = load(path.join(ev, "ios/components.json")) || { components: {}, screens: {} };
  const ac = load(path.join(ev, "android/components.json")) || { components: {}, screens: {} };
  const iflow = load(path.join(ev, "ios/flows.json")) || { flows: {} };
  const aflow = load(path.join(ev, "android/flows.json")) || { flows: {} };
  const di = ic.device || iflow.device || null;
  const da = ac.device || aflow.device || null;

  const components = spec.components.map((c) => {
    const i = ic.components[c.id];
    const a = ac.components[c.id];
    const checks = {
      present: { ios: !!i?.found, android: !!a?.found, ok: !!i?.found && !!a?.found },
      label: check(i?.label, a?.label, c.label),
      role: check(i?.role, a?.role, c.role || "static"),
      geometry: geometry(i, a, di, da),
    };
    if (VALUE_KINDS.has(c.kind)) checks.value = check(i?.value ?? undefined, a?.value ?? undefined);
    const hard = checks.present.ok && checks.label.ok && checks.role.ok;
    const soft = checks.geometry.ok && (checks.value?.ok ?? true);
    return {
      id: c.id, kind: c.kind, screen: c.screen, label: c.label,
      status: !hard ? "fail" : soft ? "pass" : "warn",
      checks,
      images: { ios: rel(slug, "ios", i?.image), android: rel(slug, "android", a?.image) },
    };
  });

  const flows = spec.flows.map((f) => {
    const i = iflow.flows[f.id];
    const a = aflow.flows[f.id];
    const steps = f.steps.map((s, n) => ({
      action: s.action, target: s.target, expected: s.value ?? s.text ?? null,
      ios: i?.steps?.[n] ? { ok: i.steps[n].ok, detail: i.steps[n].detail } : null,
      android: a?.steps?.[n] ? { ok: a.steps[n].ok, detail: a.steps[n].detail } : null,
    }));
    const iosPass = !!i?.passed;
    const androidPass = !!a?.passed;
    return { id: f.id, name: f.name, steps, ios: iosPass, android: androidPass, status: iosPass && androidPass ? "pass" : "fail" };
  });

  const screens = spec.screens.map((s) => ({
    id: s.id, name: s.name,
    ios: rel(slug, "ios", ic.screens?.[s.id]),
    android: rel(slug, "android", ac.screens?.[s.id]),
  }));

  const exists = (p) => fs.existsSync(path.join(ev, p));
  const findArtifact = (platform, re) => {
    const d = path.join(ev, platform);
    const f = fs.existsSync(d) ? fs.readdirSync(d).find((n) => re.test(n)) : null;
    return f ? `${platform}/${f}` : null;
  };

  const count = (s) => components.filter((c) => c.status === s).length;
  const checksAll = components.flatMap((c) => Object.values(c.checks));
  const passedChecks = checksAll.filter((x) => x.ok).length + flows.filter((f) => f.status === "pass").length;
  const totalChecks = checksAll.length + flows.length;

  const report = {
    schema: 1,
    company: spec.company, slug, url: spec.url, industry: spec.industry, tagline: spec.tagline, brand: spec.brand,
    generatedAt: new Date().toISOString(),
    ios: { ...spec.ios, device: di },
    android: { ...spec.android, device: da },
    summary: {
      score: totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 0,
      checks: { passed: passedChecks, total: totalChecks },
      components: { total: components.length, pass: count("pass"), warn: count("warn"), fail: count("fail") },
      flows: { total: flows.length, parity: flows.filter((f) => f.status === "pass").length, ios: flows.filter((f) => f.ios).length, android: flows.filter((f) => f.android).length },
    },
    videos: {
      ios: exists("ios/walkthrough.mp4") ? "ios/walkthrough.mp4" : null,
      android: exists("android/walkthrough.mp4") ? "android/walkthrough.mp4" : null,
    },
    artifacts: { ios: findArtifact("ios", /-simulator\.zip$/), android: findArtifact("android", /\.apk$/) },
    screens, components, flows,
  };
  write(path.join(dir, "parity.json"), JSON.stringify(report, null, 2));
  return report;
}
