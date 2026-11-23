"use client";
import { useEffect, useState } from "react";

const STEPS = [["generated", "Spec + native apps generated"], ["ios", "iOS build, XCUITest + recording"], ["android", "Android build, Compose tests + frames"], ["hasReport", "Parity report"]];

export default function GenerateForm({ support = { available: true } }) {
  const [company, setCompany] = useState("");
  const [slug, setSlug] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const t = setInterval(async () => {
      const s = await fetch(`/api/status/${slug}`).then((r) => r.json());
      setStatus(s);
      if (s.hasReport && s.ios !== "running" && s.android !== "running") clearInterval(t);
    }, 2000);
    return () => clearInterval(t);
  }, [slug]);

  async function submit(e) {
    e.preventDefault();
    setError(null); setStatus(null);
    const res = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ company }) });
    const body = await res.json();
    if (!res.ok) return setError(body.error);
    setSlug(body.slug);
  }

  const state = (key) => {
    const v = status?.[key];
    if (v === true || v === "done") return "done";
    if (v === "running") return "running";
    if (v === "failed") return "failed";
    return "pending";
  };

  return (
    <form className="generate" onSubmit={submit}>
      <label htmlFor="company">New customer</label>
      <div className="generate-row">
        <input id="company" disabled={!support.available} data-testid="company-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Paste a company name or website, e.g. evinova.com" />
        <button type="submit" disabled={!support.available || !company.trim() || (slug && !status?.hasReport)}>Generate apps</button>
      </div>
      {!support.available && <p className="notice" data-testid="generate-unavailable">{support.reason}</p>}
      <p className="hint">Runs <code>parity run</code> on this Mac: writes the spec, generates SwiftUI + Compose apps, runs both test suites, records the walkthrough and builds the parity page.</p>
      {error && <p className="error">{error}</p>}
      {slug && (
        <div className="progress" data-testid="generate-progress">
          {STEPS.map(([key, label]) => (
            <div key={key} className={`step ${state(key)}`}><span className="dot" />{label}</div>
          ))}
          {status?.hasReport && <a className="button" href={`/customers/${slug}`}>Open {slug} parity page →</a>}
          {status?.log?.length > 0 && <pre>{status.log.join("\n")}</pre>}
        </div>
      )}
    </form>
  );
}
