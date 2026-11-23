import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "@/lib/data";

// Kicks off `parity run "<company>"` on this machine (needs macOS + Xcode for
// iOS, JDK 17 + Android SDK for Android). Progress lands in status.json.
export async function POST(request) {
  const { company } = await request.json().catch(() => ({}));
  if (!company || typeof company !== "string" || company.length > 2048) {
    return Response.json({ error: "Paste a company name or website" }, { status: 400 });
  }
  const { parseCompanyInput, slugify } = await import("../../../../cli/lib/spec.mjs");
  const slug = slugify(parseCompanyInput(company).name);
  const logDir = path.join(ROOT, "customers", slug);
  fs.mkdirSync(logDir, { recursive: true });
  const log = fs.openSync(path.join(logDir, "run.log"), "w");
  const child = spawn(process.execPath, [path.join(ROOT, "cli/parity.mjs"), "run", company], { cwd: ROOT, detached: true, stdio: ["ignore", log, log] });
  child.unref();
  return Response.json({ slug });
}
