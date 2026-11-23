import fs from "node:fs";
import path from "node:path";
import { CUSTOMERS } from "@/lib/data";

const TYPES = { ".png": "image/png", ".mp4": "video/mp4", ".json": "application/json", ".zip": "application/zip", ".apk": "application/vnd.android.package-archive", ".log": "text/plain" };

export async function GET(request, { params }) {
  const { slug, path: parts } = await params;
  const base = path.join(CUSTOMERS, slug, "evidence");
  const file = path.resolve(base, ...parts);
  if (!file.startsWith(base + path.sep) || !fs.existsSync(file)) return new Response("not found", { status: 404 });
  const stat = fs.statSync(file);
  const type = TYPES[path.extname(file)] || "application/octet-stream";
  const range = request.headers.get("range");
  if (range && type === "video/mp4") {
    const [s, e] = range.replace("bytes=", "").split("-");
    const start = Number(s);
    const end = e ? Number(e) : stat.size - 1;
    return new Response(fs.createReadStream(file, { start, end }), {
      status: 206,
      headers: { "content-type": type, "content-range": `bytes ${start}-${end}/${stat.size}`, "accept-ranges": "bytes", "content-length": String(end - start + 1) },
    });
  }
  return new Response(fs.createReadStream(file), { headers: { "content-type": type, "content-length": String(stat.size), "accept-ranges": "bytes" } });
}
