import XCTest

// Generic parity runner: reads parity-spec.json (the same contract the
// Android Robolectric runner reads), captures every component and runs every
// flow, then writes components.json / flows.json + PNGs to $PARITY_OUT.

struct PStep: Decodable { let action: String; let target: String; let value: String?; let text: String? }
struct PComp: Decodable { let id: String; let screen: String; let kind: String; let label: String }
struct PScreen: Decodable { let id: String; let name: String; let route: [PStep] }
struct PFlow: Decodable { let id: String; let name: String; let steps: [PStep] }
struct PSpec: Decodable { let components: [PComp]; let screens: [PScreen]; let flows: [PFlow] }

final class ParityUITests: XCTestCase {
    private var app: XCUIApplication!
    private var frameIndex = 0

    private lazy var spec: PSpec = {
        let url = Bundle(for: ParityUITests.self).url(forResource: "parity-spec", withExtension: "json")!
        return try! JSONDecoder().decode(PSpec.self, from: Data(contentsOf: url))
    }()

    private lazy var outDir: URL = {
        let env = ProcessInfo.processInfo.environment
        let path = env["PARITY_OUT"] ?? (NSTemporaryDirectory() as NSString).appendingPathComponent("parity-ios")
        let url = URL(fileURLWithPath: path)
        for sub in ["components", "screens", "frames"] {
            try? FileManager.default.createDirectory(at: url.appendingPathComponent(sub), withIntermediateDirectories: true)
        }
        return url
    }()

    private var pause: TimeInterval {
        ProcessInfo.processInfo.environment["PARITY_PACING"] == "1" ? 1.0 : 0.3
    }

    override func setUp() {
        continueAfterFailure = true
    }

    private func launch() {
        app?.terminate()
        app = XCUIApplication()
        app.launch()
        _ = el("tab.home").waitForExistence(timeout: 10)
    }

    private func el(_ id: String) -> XCUIElement {
        app.descendants(matching: .any).matching(identifier: id).firstMatch
    }

    private func role(_ type: XCUIElement.ElementType) -> String {
        switch type {
        case .button, .switch, .cell, .link, .toggle: return "interactive"
        case .textField, .searchField, .secureTextField, .textView: return "input"
        default: return "static"
        }
    }

    private func write(_ data: Data, _ relative: String) {
        try? data.write(to: outDir.appendingPathComponent(relative))
    }

    private func settle() { Thread.sleep(forTimeInterval: pause) }

    private func waitFor(_ timeout: TimeInterval, _ condition: () -> Bool) -> Bool {
        let end = Date().addingTimeInterval(timeout)
        repeat {
            if condition() { return true }
            Thread.sleep(forTimeInterval: 0.1)
        } while Date() < end
        return condition()
    }

    @discardableResult
    private func perform(_ step: PStep) -> (ok: Bool, detail: String) {
        let e = el(step.target)
        switch step.action {
        case "tap":
            guard e.waitForExistence(timeout: 5) else { return (false, "\(step.target) not found") }
            e.tap(); settle()
            return (true, "tapped \(step.target)")
        case "type":
            guard e.waitForExistence(timeout: 5) else { return (false, "\(step.target) not found") }
            e.tap(); e.typeText(step.text ?? ""); settle()
            return (true, "typed \"\(step.text ?? "")\"")
        case "expectExists":
            let ok = e.waitForExistence(timeout: 5)
            return (ok, ok ? "\(step.target) shown" : "\(step.target) missing")
        case "expectMissing":
            let ok = waitFor(3) { !e.exists }
            return (ok, ok ? "\(step.target) hidden" : "\(step.target) still shown")
        case "expectLabel":
            let ok = e.waitForExistence(timeout: 5) && waitFor(2) { e.label == step.value }
            return (ok, "label \"\(e.exists ? e.label : "-")\" (expected \"\(step.value ?? "")\")")
        case "expectValue":
            let ok = e.waitForExistence(timeout: 5) && waitFor(2) { (e.value as? String) == step.value }
            return (ok, "value \"\(e.exists ? (e.value as? String ?? "-") : "-")\" (expected \"\(step.value ?? "")\")")
        default:
            return (false, "unknown action \(step.action)")
        }
    }

    private func device() -> [String: Any] {
        let env = ProcessInfo.processInfo.environment
        let window = app.windows.firstMatch.frame
        return [
            "platform": "ios",
            "device": env["SIMULATOR_DEVICE_NAME"] ?? "iOS Simulator",
            "os": "iOS \(env["SIMULATOR_RUNTIME_VERSION"] ?? "")",
            "runner": "XCUITest",
            "width": window.width, "height": window.height, "unit": "pt",
        ]
    }

    func test1Components() throws {
        var results: [String: Any] = [:]
        var screens: [String: Any] = [:]
        var info: [String: Any] = [:]
        for screen in spec.screens {
            launch()
            for step in screen.route { perform(step) }
            settle()
            write(XCUIScreen.main.screenshot().pngRepresentation, "screens/\(screen.id).png")
            screens[screen.id] = "screens/\(screen.id).png"
            info = device()
            for comp in spec.components where comp.screen == screen.id {
                let e = el(comp.id)
                let found = e.waitForExistence(timeout: 4)
                var entry: [String: Any] = ["found": found]
                if found {
                    let f = e.frame
                    entry["label"] = e.label
                    entry["value"] = e.value as? String ?? NSNull()
                    entry["role"] = role(e.elementType)
                    entry["frame"] = ["x": f.minX, "y": f.minY, "w": f.width, "h": f.height]
                    write(e.screenshot().pngRepresentation, "components/\(comp.id).png")
                    entry["image"] = "components/\(comp.id).png"
                }
                XCTAssertTrue(found, "\(comp.id) not found on \(screen.id)")
                results[comp.id] = entry
            }
        }
        let doc: [String: Any] = ["device": info, "components": results, "screens": screens]
        write(try JSONSerialization.data(withJSONObject: doc, options: [.prettyPrinted, .sortedKeys]), "components.json")
    }

    func test2Flows() throws {
        var results: [String: Any] = [:]
        launch()
        for (index, flow) in spec.flows.enumerated() {
            // Switching tabs rebuilds every screen, so tapping Home resets state
            // between flows without relaunching (keeps the recording continuous).
            if index > 0 { perform(PStep(action: "tap", target: "tab.home", value: nil, text: nil)) }
            var steps: [[String: Any]] = []
            var passed = true
            frame("\(flow.id)-start")
            for step in flow.steps {
                let r = perform(step)
                passed = passed && r.ok
                steps.append(["action": step.action, "target": step.target, "ok": r.ok, "detail": r.detail])
                frame("\(flow.id)-\(steps.count)")
            }
            XCTAssertTrue(passed, "flow \(flow.id) failed")
            results[flow.id] = ["passed": passed, "steps": steps]
            settle()
        }
        let doc: [String: Any] = ["device": device(), "flows": results]
        write(try JSONSerialization.data(withJSONObject: doc, options: [.prettyPrinted, .sortedKeys]), "flows.json")
    }

    private func frame(_ name: String) {
        frameIndex += 1
        write(XCUIScreen.main.screenshot().pngRepresentation, String(format: "frames/%03d-%@.png", frameIndex, name))
    }
}
