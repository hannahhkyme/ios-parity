import { notFound } from "next/navigation";
import { getCustomer, evidenceUrl } from "@/lib/data";

export const dynamic = "force-dynamic";

const Mark = ({ ok }) => <span className={`mark ${ok ? "ok" : "no"}`}>{ok ? "✓" : "✗"}</span>;
const Pill = ({ status }) => <span className={`pill ${status}`}>{status}</span>;

function Device({ title, device, video, artifact, slug, kind }) {
  return (
    <div className="device">
      <div className="device-head">
        <strong>{title}</strong>
        <span className="muted">{device ? `${device.device} · ${device.os} · ${device.runner}` : "not run yet"}</span>
      </div>
      {video ? (
        <video data-testid={`video-${kind}`} src={evidenceUrl(slug, video)} controls muted playsInline preload="metadata" />
      ) : (
        <div className="empty">No recording yet</div>
      )}
      {kind === "android" && video && <p className="caption">Frames rendered by Robolectric (no emulator on this Mac), one per flow step.</p>}
      {kind === "ios" && video && <p className="caption">Simulator screen recording of the XCUITest flow run.</p>}
      {artifact && <a className="download" href={evidenceUrl(slug, artifact)}>Download {kind === "ios" ? "simulator build (.app.zip)" : "debug APK"}</a>}
    </div>
  );
}

export default async function CustomerPage({ params }) {
  const { slug } = await params;
  const customer = getCustomer(slug);
  if (!customer) notFound();
  const { spec, report } = customer;
  const b = spec.brand;

  return (
    <article style={{ "--brand": b.primary, "--brand-accent": b.accent, "--brand-hi": b.highlight }}>
      <section className="hero-card" style={{ background: b.primary }}>
        <div>
          <p className="eyebrow" style={{ color: b.highlight }}>{spec.industry} · generated {new Date(spec.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
          <h1 data-testid="customer-name">{spec.company}</h1>
          <p className="hero-sub">{spec.tagline}</p>
          <p className="hero-ids"><code>{spec.ios.bundleId}</code> (iOS) · <code>{spec.android.packageName}</code> (Android){spec.url && <> · <a href={spec.url}>{new URL(spec.url).host}</a></>}</p>
        </div>
        {report && (
          <div className="hero-score" data-testid="parity-score">
            <strong>{report.summary.score}%</strong>
            <span>{report.summary.checks.passed}/{report.summary.checks.total} checks</span>
          </div>
        )}
      </section>

      {!report ? (
        <p className="muted">No parity report yet. Run <code>npm run parity -- run {slug}</code>.</p>
      ) : (
        <>
          <div className="stats">
            <div><strong>{report.summary.components.pass}/{report.summary.components.total}</strong><span>components identical</span></div>
            <div><strong>{report.summary.components.warn}</strong><span>within-tolerance diffs</span></div>
            <div><strong>{report.summary.components.fail}</strong><span>components failing</span></div>
            <div><strong>{report.summary.flows.parity}/{report.summary.flows.total}</strong><span>flows pass on both</span></div>
          </div>

          <h2 className="section-title">Screen recordings</h2>
          <div className="devices">
            <Device title="iOS · SwiftUI" kind="ios" slug={slug} device={report.ios.device} video={report.videos.ios} artifact={report.artifacts.ios} />
            <Device title="Android · Jetpack Compose" kind="android" slug={slug} device={report.android.device} video={report.videos.android} artifact={report.artifacts.android} />
          </div>

          <h2 className="section-title">How parity is proven</h2>
          <ol className="method">
            <li><strong>One spec.</strong> <a href={evidenceUrl(slug, "spec.json")}><code>customers/{slug}/spec.json</code></a> defines {report.components.length} components with stable ids, {report.screens.length} screens and {report.flows.length} flows. Both apps are generated from it.</li>
            <li><strong>Same ids on both platforms.</strong> Every component carries its id as the iOS <code>accessibilityIdentifier</code> and the Compose <code>testTag</code>, and its label as the accessibility label / <code>contentDescription</code>.</li>
            <li><strong>Same test contract.</strong> XCUITest and the Compose UI test both read the spec, open each screen, and record presence, label, role, value and size for every component, then run every flow step by step.</li>
            <li><strong>Compared here.</strong> Presence, label and role must match exactly (and match the spec); size may differ by up to 12% of the screen; toggles and chips must report the same state.</li>
          </ol>

          <h2 className="section-title">Screens side by side</h2>
          <div className="screens">
            {report.screens.map((s) => (
              <figure key={s.id} className="screen-pair">
                <figcaption>{s.name}</figcaption>
                <div>
                  {s.ios ? <img src={evidenceUrl(slug, s.ios)} alt={`${s.name} on iOS`} /> : <div className="empty">iOS missing</div>}
                  {s.android ? <img src={evidenceUrl(slug, s.android)} alt={`${s.name} on Android`} /> : <div className="empty">Android missing</div>}
                </div>
                <div className="platform-labels"><span>iOS</span><span>Android</span></div>
              </figure>
            ))}
          </div>

          <h2 className="section-title">Component by component</h2>
          <div className="table-wrap">
            <table className="components" data-testid="component-table">
              <thead>
                <tr><th>Component</th><th>iOS</th><th>Android</th><th>Present</th><th>Label</th><th>Role</th><th>Size (iOS / Android)</th><th>State</th><th>Result</th></tr>
              </thead>
              <tbody>
                {report.components.map((c) => (
                  <tr key={c.id} data-testid={`component-${c.id}`} className={c.status}>
                    <td><code>{c.id}</code><div className="muted small">{c.kind} · {c.screen}</div></td>
                    <td className="crop">{c.images.ios ? <img src={evidenceUrl(slug, c.images.ios)} alt={`${c.id} iOS`} /> : "—"}</td>
                    <td className="crop">{c.images.android ? <img src={evidenceUrl(slug, c.images.android)} alt={`${c.id} Android`} /> : "—"}</td>
                    <td><Mark ok={c.checks.present.ok} /></td>
                    <td><Mark ok={c.checks.label.ok} /> <span className="small">{c.checks.label.ios ?? "—"}{!c.checks.label.ok && <> / {c.checks.label.android ?? "—"}</>}</span></td>
                    <td><Mark ok={c.checks.role.ok} /> <span className="small">{c.checks.role.ios ?? "—"}{!c.checks.role.ok && <> / {c.checks.role.android ?? "—"}</>}</span></td>
                    <td><Mark ok={c.checks.geometry.ok} /> <span className="small">{c.checks.geometry.ios ? `${c.checks.geometry.ios.w}×${c.checks.geometry.ios.h}pt / ${c.checks.geometry.android.w}×${c.checks.geometry.android.h}dp` : "—"}</span></td>
                    <td>{c.checks.value ? <><Mark ok={c.checks.value.ok} /> <span className="small">{c.checks.value.ios} / {c.checks.value.android}</span></> : <span className="muted">n/a</span>}</td>
                    <td><Pill status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="section-title">Flows step by step</h2>
          <div className="flows">
            {report.flows.map((f) => (
              <details key={f.id} className="flow" data-testid={`flow-${f.id}`} open={f.status !== "pass"}>
                <summary><Pill status={f.status} /> <strong>{f.name}</strong> <span className="muted">iOS {f.ios ? "passed" : "failed"} · Android {f.android ? "passed" : "failed"}</span></summary>
                <table>
                  <thead><tr><th>#</th><th>Step</th><th>iOS</th><th>Android</th></tr></thead>
                  <tbody>
                    {f.steps.map((s, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><code>{s.action}</code> <code>{s.target}</code>{s.expected && <> = “{s.expected}”</>}</td>
                        <td>{s.ios ? <><Mark ok={s.ios.ok} /> <span className="small">{s.ios.detail}</span></> : "—"}</td>
                        <td>{s.android ? <><Mark ok={s.android.ok} /> <span className="small">{s.android.detail}</span></> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ))}
          </div>
          <p className="muted small">Report generated {new Date(report.generatedAt).toLocaleString("en-US")}. Raw evidence: <a href={evidenceUrl(slug, "spec.json")}>spec.json</a> · <a href={evidenceUrl(slug, "parity.json")}>parity.json</a> · <a href={evidenceUrl(slug, "ios/components.json")}>iOS components.json</a> · <a href={evidenceUrl(slug, "android/components.json")}>Android components.json</a> · <a href={evidenceUrl(slug, "ios/flows.json")}>iOS flows.json</a> · <a href={evidenceUrl(slug, "android/flows.json")}>Android flows.json</a></p>
        </>
      )}
    </article>
  );
}
