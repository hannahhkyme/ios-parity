import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(process.cwd(), "..");
export const CUSTOMERS = path.join(ROOT, "customers");

const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null);

export function listCustomers() {
  if (!fs.existsSync(CUSTOMERS)) return [];
  return fs.readdirSync(CUSTOMERS)
    .filter((slug) => fs.existsSync(path.join(CUSTOMERS, slug, "spec.json")))
    .map((slug) => getCustomer(slug))
    .sort((a, b) => (b.spec.createdAt || "").localeCompare(a.spec.createdAt || ""));
}

export function getCustomer(slug) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const dir = path.join(CUSTOMERS, slug);
  const spec = read(path.join(dir, "spec.json"));
  if (!spec) return null;
  return { slug, spec, report: read(path.join(dir, "parity.json")), status: read(path.join(dir, "status.json")) || {} };
}

export const evidenceUrl = (slug, p) => (p ? `/evidence/${slug}/${p}` : null);
