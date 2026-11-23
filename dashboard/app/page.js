import GenerateForm from "@/components/GenerateForm";
import { listCustomers } from "@/lib/data";
import { generationSupport } from "@/lib/generation";

export const dynamic = "force-dynamic";

export default function Home() {
  const customers = listCustomers();
  return (
    <>
      <section className="intro">
        <h1>Customer apps, proven identical on iOS and Android</h1>
        <p>Paste a company and Parity Studio generates a native SwiftUI app and a Jetpack Compose twin from one spec, drives both with the same test contract, records the walkthrough and proves parity component by component.</p>
      </section>
      <GenerateForm support={generationSupport()} />
      <h2 className="section-title">Customers</h2>
      <div className="grid" data-testid="customer-list">
        {customers.length === 0 && <p className="muted">No customers yet. Generate one above or run <code>npm run parity -- run "Company"</code>.</p>}
        {customers.map(({ slug, spec, report, status }) => (
          <a key={slug} href={`/customers/${slug}`} className="customer-card" data-testid={`customer-${slug}`}>
            <div className="swatch" style={{ background: spec.brand.primary }}>
              <span style={{ color: spec.brand.highlight }}>{spec.company.charAt(0)}</span>
            </div>
            <div className="customer-meta">
              <strong>{spec.company}</strong>
              <span className="muted">{spec.industry} · {spec.url ? new URL(spec.url).host : "name only"}</span>
            </div>
            {report ? (
              <div className={`score ${report.summary.score === 100 ? "good" : report.summary.score >= 80 ? "ok" : "bad"}`}>
                {report.summary.score}%<small>parity</small>
              </div>
            ) : (
              <div className="score pending">{status.ios === "running" || status.android === "running" ? "running" : "no report"}</div>
            )}
          </a>
        ))}
      </div>
    </>
  );
}
