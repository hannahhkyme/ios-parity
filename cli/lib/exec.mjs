import { spawn } from "node:child_process";

export function run(cmd, argv, opts = {}) {
  return new Promise((resolve, reject) => {
    console.log(`[parity] $ ${cmd} ${argv.join(" ")}`);
    const p = spawn(cmd, argv, { stdio: opts.quiet ? ["ignore", "pipe", "pipe"] : "inherit", ...opts });
    let out = "";
    p.stdout?.on("data", (d) => (out += d));
    p.stderr?.on("data", (d) => (out += d));
    p.on("error", reject);
    p.on("close", (code) => (code === 0 || opts.allowFail ? resolve({ code, out }) : reject(new Error(`${cmd} exited ${code}${opts.quiet ? `\n${out.slice(-3000)}` : ""}`))));
  });
}

export const start = (cmd, argv, opts = {}) => spawn(cmd, argv, { stdio: "ignore", ...opts });
