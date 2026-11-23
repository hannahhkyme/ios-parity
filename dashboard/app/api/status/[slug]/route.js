import fs from "node:fs";
import path from "node:path";
import { CUSTOMERS } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) return Response.json({}, { status: 400 });
  const dir = path.join(CUSTOMERS, slug);
  const read = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), "utf8") : null);
  const status = JSON.parse(read("status.json") || "{}");
  const log = (read("run.log") || "").split("\n").filter(Boolean).slice(-8);
  return Response.json({ ...status, hasReport: !!read("parity.json"), log });
}
