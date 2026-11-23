import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const customerDir = (slug) => path.join(ROOT, "customers", slug);

export function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export function copyTemplate(src, dest, tokens = {}) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name === "PKGDIR" && tokens.PKGDIR ? tokens.PKGDIR : entry.name);
    if (entry.isDirectory()) copyTemplate(s, d, tokens);
    else if (/\.(jar|png)$/.test(entry.name)) { fs.mkdirSync(dest, { recursive: true }); fs.copyFileSync(s, d); }
    else {
      let text = fs.readFileSync(s, "utf8");
      for (const [k, v] of Object.entries(tokens)) text = text.replaceAll(`__${k}__`, v);
      write(d, text);
      if (entry.name === "gradlew") fs.chmodSync(d, 0o755);
    }
  }
}

export const str = (s) => JSON.stringify(s);
export const readJSON = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
export const hex = (h) => h.replace("#", "");
