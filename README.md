# Parity Studio

Paste a company name or website and Parity Studio:

1. **Writes one spec** (`customers/<slug>/spec.json`): brand colours (from presets or the company's site), an industry profile (clinical, retail, banking, travel, telecom, generic), 5 screens, ~29 components with stable ids and 7 user flows.
2. **Generates two native apps from it**: a SwiftUI iOS app (`customers/<slug>/ios`, XcodeGen) and a Jetpack Compose Android twin (`customers/<slug>/android`, Gradle).
3. **Runs the same test contract on both**: XCUITest on the iOS Simulator and Compose UI tests under Robolectric read the same spec, capture every component (presence, label, role, state, size, screenshot crop) and run every flow step by step.
4. **Records the walkthrough**: a Simulator screen recording on iOS; a frame-by-frame render of the same flows on Android.
5. **Builds the parity report** (`customers/<slug>/parity.json`) and an **internal dashboard** with a page per customer that proves parity component by component.

Evinova (`customers/evinova`) is the first generated customer: a clinical-trial participant app (Today, Activities, eCOA diary entry, Profile).

## Requirements

| For | Needs |
| --- | --- |
| CLI + dashboard | Node 20+ |
| iOS | macOS, Xcode 16+, [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`), an iPhone simulator |
| Android | JDK 17, Android SDK with platform 34 (`ANDROID_HOME`, or `~/Library/Android/sdk`) |
| Video | `ffmpeg` (`brew install ffmpeg`) |

No Android emulator is needed: the Android twin is exercised with Robolectric, so it runs on any Mac (including CI and VMs without nested virtualisation). The debug APK is still built and can be installed on a device or emulator.

## Quick start

```bash
npm install                     # installs the dashboard too
npm run parity -- run "https://evinova.com"   # or any company name / URL
npm run dashboard               # http://localhost:3100
```

Or paste the company into **New customer** on the dashboard home page; it runs the same pipeline on the machine serving the dashboard and links to the new parity page when done.

### Individual steps

```bash
npm run parity -- new "Acme Bank" [--industry banking] [--color "#0B3D91"]   # spec + both apps
npm run parity -- ios acme-bank       # build, XCUITest parity run, simulator recording
npm run parity -- android acme-bank   # build APK, Robolectric parity run, frames + video
npm run parity -- report acme-bank    # write parity.json
npm run parity -- list
npm test                              # CLI unit tests
```

Open the generated iOS project in Xcode with `cd customers/<slug>/ios && xcodegen generate && open *.xcodeproj`. Open the Android project in Android Studio from `customers/<slug>/android`.

## How parity is proven

- Every component has the same id on both platforms: the SwiftUI `accessibilityIdentifier` and the Compose `testTag` (e.g. `home.hero`, `browse.row.2`, `detail.primary`, `account.toggle`).
- Its accessibility label (`accessibilityLabel` / `contentDescription`) must equal the label in the spec on both platforms.
- Its role (static, interactive, input) must match; chips and toggles must report the same state (`selected` / `on`).
- Its size may differ by at most 12% of the screen (points vs dp).
- Each flow (`hero-cta`, `open-detail`, `select-option`, `primary-action`, `search-filter`, `toggle`, `tab-nav`) must pass on both platforms, step by step.

Presence, label and role mismatches fail a component; size or state differences are warnings. The score is passed checks over all checks.

## Layout

```
cli/                 parity CLI (spec builder, profiles, generators, runners, report)
templates/ios        SwiftUI component library, app shell, generic XCUITest parity runner
templates/android    Compose component library, app shell, generic Robolectric parity runner
customers/<slug>/    spec.json, generated ios/ + android/ apps, evidence/, parity.json
dashboard/           Next.js internal dashboard (customer index + per-customer parity page)
test/                node:test unit tests for the CLI
```

Generated apps are plain source you can edit, but re-running `parity new` overwrites them from the templates. Change a component for every customer in `templates/`, or a single customer's copy in `customers/<slug>/`.
