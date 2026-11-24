import test from "node:test";
import assert from "node:assert/strict";
import { parseCompanyInput, buildSpec, slugify, pascal } from "../cli/lib/spec.mjs";
import { guessIndustry, PROFILES } from "../cli/lib/profiles.mjs";

test("parses a pasted URL with tracking params down to the company", () => {
  const r = parseCompanyInput("https://evinova.com/?utm_source=google&gclid=abc");
  assert.deepEqual(r, { name: "Evinova", url: "https://evinova.com/" });
});

test("parses bare domains and plain names", () => {
  assert.equal(parseCompanyInput("www.gap.com").name, "Gap");
  assert.deepEqual(parseCompanyInput("Acme Robotics"), { name: "Acme Robotics", url: null });
});

test("slug and module names are platform-safe", () => {
  assert.equal(slugify("Dr. Martens & Co"), "dr-martens-co");
  assert.equal(pascal("7-Eleven"), "App7Eleven");
});

test("industry detection", () => {
  assert.equal(guessIndustry("Evinova"), "clinical");
  assert.equal(guessIndustry("First Bank"), "banking");
});

test("spec is a complete parity contract", () => {
  const spec = buildSpec({ name: "Evinova", url: "https://evinova.com/" });
  assert.equal(spec.industry, "clinical");
  assert.equal(spec.brand.primary, "#3B0030");
  const ids = new Set(spec.components.map((c) => c.id));
  assert.equal(ids.size, spec.components.length, "component ids are unique");
  for (const flow of spec.flows) for (const step of flow.steps) assert.ok(ids.has(step.target) || step.target.startsWith("tab."), `${flow.id} targets ${step.target}`);
  for (const screen of spec.screens) assert.ok(spec.components.some((c) => c.screen === screen.id), `${screen.id} has components`);
});

test("unknown companies still get a full spec with derived branding", () => {
  const spec = buildSpec({ name: "Zentrix Logistics" });
  assert.match(spec.brand.primary, /^#[0-9A-F]{6}$/i);
  assert.equal(spec.ios.bundleId, "com.paritystudio.zentrixlogistics");
  assert.ok(spec.components.length > 20);
});

test("Innodata gets branded solution content without overriding an explicit industry", () => {
  const company = parseCompanyInput("innodata.com");
  const spec = buildSpec(company);
  assert.equal(spec.company, "Innodata");
  assert.equal(spec.brand.primary, "#0170B9");
  assert.deepEqual(spec.content.items.map(({ title }) => title), ["Data Annotation", "Model Evaluation", "Synodex", "Agility PR"]);
  assert.equal(spec.flows.find(({ id }) => id === "search-filter").steps[1].text, "Synodex");
  assert.deepEqual(buildSpec({ ...company, industry: "retail" }).content, PROFILES.retail("Innodata"));
});

test("Fortitude Financial's website generates its advisory services demo", () => {
  const spec = buildSpec(parseCompanyInput("https://www.fortitudefinancial.com/"));
  assert.equal(spec.slug, "fortitudefinancial");
  assert.equal(spec.company, "Fortitude Financial");
  assert.equal(spec.industry, "banking");
  assert.equal(spec.brand.primary, "#0C3C54");
  assert.deepEqual(spec.content.items.map(({ title }) => title), ["Financial Planning", "Investment Management", "Retirement Strategies", "Legacy Planning"]);
  assert.equal(spec.flows.find(({ id }) => id === "search-filter").steps[1].text, "Retirement");
});
