import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { customerDir, readJSON } from "./util.mjs";
import { run, start } from "./exec.mjs";

function bootedSimulator(preferred) {
  const data = JSON.parse(execSync("xcrun simctl list devices available -j").toString()).devices;
  const all = Object.entries(data).flatMap(([rt, ds]) => ds.map((d) => ({ ...d, rt })));
  if (preferred) return all.find((d) => d.udid === preferred || d.name === preferred);
  return all.find((d) => d.state === "Booted" && d.name.startsWith("iPhone")) || all.find((d) => d.name.startsWith("iPhone 17"));
}

export async function runIOS(slug, flags = {}) {
  const dir = customerDir(slug);
  const spec = readJSON(path.join(dir, "spec.json"));
  const ios = path.join(dir, "ios");
  const out = path.join(dir, "evidence/ios");
  const derived = path.join(ios, "build");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const sim = bootedSimulator(flags.simulator || process.env.SIM_UDID);
  if (!sim) throw new Error("no iPhone simulator available");
  if (sim.state !== "Booted") await run("xcrun", ["simctl", "boot", sim.udid], { allowFail: true });
  await run("xcrun", ["simctl", "bootstatus", sim.udid, "-b"], { quiet: true, allowFail: true });

  await run("xcodegen", ["generate", "--spec", "project.yml"], { cwd: ios, quiet: true });
  const base = ["-project", `${spec.ios.target}.xcodeproj`, "-scheme", spec.ios.target,
    "-destination", `platform=iOS Simulator,id=${sim.udid}`, "-derivedDataPath", derived];
  await run("xcodebuild", [...base, "build-for-testing", "-quiet"], { cwd: ios });

  const env = { ...process.env, TEST_RUNNER_PARITY_OUT: out };
  const testOnly = (name) => ["test-without-building", ...base, `-only-testing:${spec.ios.target}UITests/ParityUITests/${name}`];

  await run("xcodebuild", testOnly("test1Components"), { cwd: ios, env, quiet: true, allowFail: true })
    .then((r) => fs.writeFileSync(path.join(out, "xcodebuild-components.log"), r.out));

  // Flows run on camera: record the simulator while the paced flow test drives the app.
  const raw = path.join(out, "walkthrough-raw.mp4");
  const video = path.join(out, "walkthrough.mp4");
  const rec = start("xcrun", ["simctl", "io", sim.udid, "recordVideo", "--codec=h264", "--force", raw]);
  await new Promise((r) => setTimeout(r, 1500));
  const flowEnv = { ...env, TEST_RUNNER_PARITY_PACING: flags.fast ? "0" : "1" };
  const res = await run("xcodebuild", testOnly("test2Flows"), { cwd: ios, env: flowEnv, quiet: true, allowFail: true });
  fs.writeFileSync(path.join(out, "xcodebuild-flows.log"), res.out);
  rec.kill("SIGINT");
  await new Promise((r) => rec.on("close", r));
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-vf", "scale=-2:1280,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-movflags", "+faststart", "-an", video], { quiet: true, allowFail: true });
  if (fs.existsSync(video)) fs.rmSync(raw, { force: true }); else fs.renameSync(raw, video);
  for (const f of fs.readdirSync(out)) if (f.includes(".sb-")) fs.rmSync(path.join(out, f), { force: true });

  for (const f of ["components.json", "flows.json"]) {
    if (!fs.existsSync(path.join(out, f))) throw new Error(`iOS run did not write ${f}; see evidence/ios/xcodebuild-*.log`);
  }
  const app = path.join(derived, "Build/Products/Debug-iphonesimulator", `${spec.ios.target}.app`);
  if (fs.existsSync(app)) {
    await run("ditto", ["-c", "-k", "--keepParent", app, path.join(out, `${spec.ios.target}-simulator.zip`)], { quiet: true });
  }
  console.log(`[parity] iOS evidence -> ${path.relative(process.cwd(), out)}`);
}
