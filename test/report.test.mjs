import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildSpec } from "../cli/lib/spec.mjs";
import { customerDir, write } from "../cli/lib/util.mjs";
import { buildReport } from "../cli/lib/report.mjs";

function evidence(spec, platform, mutate = () => {}) {
  const unit = platform === "ios" ? "pt" : "dp";
  const components = Object.fromEntries(spec.components.map((c) => [c.id, {
    found: true, label: c.label, role: c.role || "static", value: c.kind === "ToggleRow" ? "off" : c.kind === "Chip" ? "unselected" : null,
    frame: { x: 0, y: 0, w: 100, h: 40 },
  }]));
  mutate(components);
  const flows = Object.fromEntries(spec.flows.map((f) => [f.id, { passed: true, steps: f.steps.map(() => ({ ok: true, detail: "ok" })) }]));
  const device = { width: 402, height: 874, unit };
  return { components: { device, components, screens: {} }, flows: { device, flows } };
}

test("report scores matching evidence at 100% and flags a label mismatch", async () => {
  const spec = buildSpec({ name: "Report Fixture Co" });
  const dir = customerDir(spec.slug);
  try {
    write(path.join(dir, "spec.json"), JSON.stringify(spec));
    for (const p of ["ios", "android"]) {
      const e = evidence(spec, p, p === "android" ? () => {} : () => {});
      write(path.join(dir, `evidence/${p}/components.json`), JSON.stringify(e.components));
      write(path.join(dir, `evidence/${p}/flows.json`), JSON.stringify(e.flows));
    }
    let r = await buildReport(spec.slug);
    assert.equal(r.summary.score, 100);
    assert.equal(r.summary.components.fail, 0);

    const bad = evidence(spec, "android", (c) => { c["home.hero"].label = "Something else"; });
    write(path.join(dir, "evidence/android/components.json"), JSON.stringify(bad.components));
    r = await buildReport(spec.slug);
    const hero = r.components.find((c) => c.id === "home.hero");
    assert.equal(hero.status, "fail");
    assert.equal(hero.checks.label.ok, false);
    assert.ok(r.summary.score < 100);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
