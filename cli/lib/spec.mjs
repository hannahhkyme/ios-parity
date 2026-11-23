import { PROFILES, PRESETS, ICONS, guessIndustry } from "./profiles.mjs";

export function parseCompanyInput(input) {
  const raw = input.trim();
  let url = null;
  let name = raw;
  if (/^https?:\/\//i.test(raw) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(raw)) {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    url = `${u.protocol}//${u.host}/`;
    const host = u.hostname.replace(/^www\./, "");
    name = host.split(".")[0];
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  return { name, url };
}

export function slugify(name) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "company";
}

export function pascal(name) {
  const p = name.normalize("NFKD").replace(/[^A-Za-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  return /^[0-9]/.test(p) ? `App${p}` : p || "Company";
}

function hashHue(s) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 360;
}

function hsl(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function brandFromColor(primary) {
  const hue = hashHue(primary);
  return {
    primary,
    accent: hsl((hue + 330) % 360, 70, 52),
    highlight: hsl((hue + 40) % 360, 90, 60),
    surface: hsl(hue, 30, 95),
    onPrimary: luminance(primary) > 0.45 ? "#111111" : "#FFFFFF",
  };
}

function generatedBrand(name) {
  const hue = hashHue(name.toLowerCase());
  return brandFromColor(hsl(hue, 65, 28));
}

// Best effort: read the company's homepage for a title and its most used dark colour.
export async function scrapeSite(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 parity-studio" }, signal: AbortSignal.timeout(8000) });
    const html = await res.text();
    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1]?.trim();
    const h1 = (html.match(/<h1[^>]*>([^<]*)<\/h1>/i) || [])[1]?.trim();
    const counts = {};
    for (const c of html.match(/#[0-9a-fA-F]{6}\b/g) || []) counts[c.toUpperCase()] = (counts[c.toUpperCase()] || 0) + 1;
    const dark = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([c]) => c).find((c) => luminance(c) < 0.08);
    return { title, headline: h1, primary: dark };
  } catch {
    return {};
  }
}

const step = (action, target, extra = {}) => ({ action, target, ...extra });

export function buildSpec({ name, url = null, industry, primary, site = {} }) {
  const slug = slugify(name);
  const preset = PRESETS[slug] || {};
  const displayName = preset.displayName || site.title?.split(/[|\-–]/)[0].trim() || name;
  const vertical = industry || preset.industry || guessIndustry(`${name} ${site.title || ""} ${site.headline || ""}`);
  const brand = primary ? brandFromColor(primary) : preset.brand || (site.primary ? brandFromColor(site.primary) : generatedBrand(name));
  const content = PROFILES[vertical](displayName);
  const module = pascal(displayName);
  const id = slug.replace(/-/g, "");
  const items = content.items;
  const searchWord = items[2].title.split(" ")[0];

  const components = [];
  const add = (cid, screen, kind, label, extra = {}) => components.push({ id: cid, screen, kind, label, ...extra });
  add("home.topbar", "home", "TopBar", displayName);
  add("home.hero", "home", "HeroBanner", content.hero.title);
  add("home.hero.cta", "home", "PrimaryButton", content.hero.cta, { role: "interactive" });
  content.stats.forEach((s, i) => add(`home.stat.${i}`, "home", "StatTile", `${s.label}: ${s.value}`));
  add("home.section", "home", "SectionHeader", content.sectionTitle);
  items.slice(0, 2).forEach((it, i) => add(`home.card.${i}`, "home", "ItemCard", it.title, { role: "interactive" }));
  content.tabs.forEach((t) => add(`tab.${t.id}`, "home", "TabItem", t.title, { role: "interactive" }));
  add("browse.search", "browse", "SearchField", content.searchPlaceholder, { role: "input" });
  items.forEach((it, i) => add(`browse.row.${i}`, "browse", "ListRow", it.title, { role: "interactive" }));
  add("detail.header", "detail", "DetailHeader", items[0].title);
  add("detail.value", "detail", "ValuePill", items[0].value);
  add("detail.options", "detail", "SectionHeader", content.detail.optionsTitle);
  content.detail.options.forEach((o, i) =>
    add(`detail.option.${i}`, "detail", "Chip", o, { role: "interactive", value: i === 0 ? "selected" : "unselected" }));
  add("detail.primary", "detail", "PrimaryButton", content.detail.primaryAction, { role: "interactive" });
  add("detail.confirmation", "detail_confirmed", "ConfirmationBanner", content.detail.confirmation);
  add("account.profile", "account", "ProfileHeader", content.account.name);
  content.account.rows.forEach((r, i) => add(`account.row.${i}`, "account", "SettingsRow", r.title, { role: "interactive" }));
  add("account.toggle", "account", "ToggleRow", content.account.toggle, { role: "interactive", value: "off" });

  const toBrowse = [step("tap", "tab.browse")];
  const toDetail = [...toBrowse, step("tap", "browse.row.0")];
  const screens = [
    { id: "home", name: content.tabs[0].title, route: [] },
    { id: "browse", name: content.tabs[1].title, route: toBrowse },
    { id: "detail", name: "Detail", route: toDetail },
    { id: "detail_confirmed", name: "Confirmation", route: [...toDetail, step("tap", "detail.primary")] },
    { id: "account", name: content.tabs[2].title, route: [step("tap", "tab.account")] },
  ];

  const flows = [
    { id: "hero-cta", name: `"${content.hero.cta}" opens ${content.tabs[1].title}`,
      steps: [step("tap", "home.hero.cta"), step("expectExists", "browse.search")] },
    { id: "open-detail", name: `Open "${items[0].title}"`,
      steps: [...toDetail, step("expectLabel", "detail.header", { value: items[0].title })] },
    { id: "select-option", name: `Choose "${content.detail.options[1]}"`,
      steps: [...toDetail, step("tap", "detail.option.1"), step("expectValue", "detail.option.1", { value: "selected" }),
        step("expectValue", "detail.option.0", { value: "unselected" })] },
    { id: "primary-action", name: `"${content.detail.primaryAction}" confirms`,
      steps: [...toDetail, step("tap", "detail.primary"), step("expectLabel", "detail.confirmation", { value: content.detail.confirmation })] },
    { id: "search-filter", name: `Search "${searchWord}" filters the list`,
      steps: [...toBrowse, step("type", "browse.search", { text: searchWord }), step("expectExists", "browse.row.2"),
        step("expectMissing", "browse.row.0")] },
    { id: "toggle", name: `Turn on "${content.account.toggle}"`,
      steps: [step("tap", "tab.account"), step("tap", "account.toggle"), step("expectValue", "account.toggle", { value: "on" })] },
    { id: "tab-nav", name: "Tab bar navigation",
      steps: [step("tap", "tab.account"), step("expectExists", "account.profile"), step("tap", "tab.home"),
        step("expectExists", "home.hero")] },
  ];

  return {
    schema: 1,
    company: displayName,
    slug,
    url: url || null,
    industry: vertical,
    tagline: preset.tagline || site.headline || content.hero.subtitle,
    createdAt: new Date().toISOString(),
    brand,
    ios: { target: `${module}App`, bundleId: `com.paritystudio.${id}`, deploymentTarget: "17.0" },
    android: { module: "app", packageName: `com.paritystudio.${id}`, minSdk: 26, compileSdk: 34 },
    icons: ICONS,
    content,
    components,
    screens,
    flows,
  };
}
