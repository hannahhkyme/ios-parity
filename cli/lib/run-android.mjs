import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { customerDir, readJSON } from "./util.mjs";
import { run } from "./exec.mjs";

export function androidEnv() {
  const env = { ...process.env };
  if (!env.ANDROID_HOME) {
    const guess = [env.ANDROID_SDK_ROOT, path.join(os.homedir(), "Library/Android/sdk"), path.join(os.homedir(), "android-sdk")].find((p) => p && fs.existsSync(p));
    if (guess) env.ANDROID_HOME = guess;
  }
  if (!env.JAVA_HOME && fs.existsSync("/opt/homebrew/opt/openjdk@17")) env.JAVA_HOME = "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home";
  return env;
}

// Stitch numbered PNG frames into an H.264 walkthrough (one frame per flow step).
export async function framesToVideo(framesDir, video, seconds = 1.2) {
  const frames = fs.existsSync(framesDir) ? fs.readdirSync(framesDir).filter((f) => f.endsWith(".png")).sort() : [];
  if (!frames.length) return false;
  const list = path.join(framesDir, "..", "frames.txt");
  fs.writeFileSync(list, frames.map((f) => `file '${path.join(framesDir, f)}'\nduration ${seconds}`).join("\n") + `\nfile '${path.join(framesDir, frames.at(-1))}'\n`);
  try {
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list,
      "-vf", "scale=-2:1280,format=yuv420p", "-r", "30", "-c:v", "libx264", "-movflags", "+faststart", video], { quiet: true });
    return true;
  } catch (e) {
    console.log(`[parity] ffmpeg unavailable, skipping video: ${e.message.split("\n")[0]}`);
    return false;
  } finally {
    fs.rmSync(list, { force: true });
  }
}

export async function runAndroid(slug, flags = {}) {
  const dir = customerDir(slug);
  const spec = readJSON(path.join(dir, "spec.json"));
  const android = path.join(dir, "android");
  const out = path.join(dir, "evidence/android");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const env = androidEnv();
  if (!env.ANDROID_HOME) throw new Error("Android SDK not found; set ANDROID_HOME");

  const res = await run("./gradlew", ["--console=plain", "-q", ":app:assembleDebug", ":app:testDebugUnitTest", "--tests", `${spec.android.packageName}.ParityTest`, `-PparityOut=${out}`],
    { cwd: android, env, quiet: true, allowFail: true });
  fs.writeFileSync(path.join(out, "gradle.log"), res.out);
  for (const f of ["components.json", "flows.json"]) {
    if (!fs.existsSync(path.join(out, f))) throw new Error(`Android run did not write ${f}; see evidence/android/gradle.log\n${res.out.slice(-2000)}`);
  }
  const apk = path.join(android, "app/build/outputs/apk/debug/app-debug.apk");
  if (fs.existsSync(apk)) fs.copyFileSync(apk, path.join(out, `${spec.ios.target.replace(/App$/, "")}-debug.apk`));
  await framesToVideo(path.join(out, "frames"), path.join(out, "walkthrough.mp4"));
  console.log(`[parity] Android evidence -> ${path.relative(process.cwd(), out)}`);
}
