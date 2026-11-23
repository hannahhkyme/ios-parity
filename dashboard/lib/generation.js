import { execFileSync } from "node:child_process";

let cached;

// `parity run` builds the iOS app with Xcode, so it can only run on a Mac with
// Xcode installed. Anywhere else (e.g. the hosted dashboard) generation is off.
export function generationSupport() {
  if (cached) return cached;
  if (process.platform !== "darwin") {
    cached = { available: false, reason: "This dashboard is hosted on Linux. Generating a customer builds the iOS app with Xcode, so it runs on macOS: run npm run parity -- run \"Company\" on a Mac (or ask the iOS Bot), then push customers/<slug> to the repo." };
    return cached;
  }
  try {
    execFileSync("xcodebuild", ["-version"], { stdio: "ignore" });
    cached = { available: true };
  } catch {
    cached = { available: false, reason: "Xcode was not found on this Mac. Install Xcode 16+ to generate customers from the dashboard." };
  }
  return cached;
}
