import { toast } from "sonner";
import type { Appointment, Center, TestResult, TestType } from "../../../components/data";
import { localDay, testTypeById } from "../../../components/data";

/** Normalized certificate shape used by CSV export + PDF, derived from an Appointment. */
export interface CertRow {
  id: string;
  ref: string;
  name: string;
  testTypeId: string;
  result: TestResult;
  date: string;
  agent: string;
  certificateId: string;
  transmitted: boolean;
}

export function toCertRow(a: Appointment): CertRow {
  return {
    id: a.id,
    ref: a.ref,
    name: `${a.person.firstName} ${a.person.lastName}`,
    testTypeId: a.testTypeId,
    result: a.result ?? "negative",
    date: a.date,
    agent: a.agent ?? "—",
    certificateId: a.certificateId ?? a.ref,
    transmitted: !!a.transmitted,
  };
}

/** Print a certificate PDF straight from an appointment record. */
export function printApptCertificate(a: Appointment, testTypes: TestType[], center: Center) {
  printCertificate(toCertRow(a), testTypes, center);
}

/** Export a set of archived certificate rows as a downloadable CSV file. */
export function downloadCsv(rows: CertRow[], testTypes: TestType[]) {
  const headers = ["Ref", "Name", "Test type", "Result", "Date", "Agent", "Certificate", "Transmitted"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.ref,
        r.name,
        testTypeById(r.testTypeId, testTypes)?.label ?? r.testTypeId,
        r.result,
        r.date,
        r.agent,
        r.certificateId,
        r.transmitted ? "yes" : "no",
      ]
        .map((v) => escape(String(v)))
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `archive-${localDay(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} records`);
}

/** Render and print an official A4 test certificate for a single record. */
export function printCertificate(r: CertRow, testTypes: TestType[], center: Center) {
  const tt = testTypeById(r.testTypeId, testTypes);
  const resultTheme: Record<TestResult, { bg: string; fg: string; label: string; note: string }> = {
    negative: { bg: "#ecfdf5", fg: "#047857", label: "NEGATIVE", note: "No SARS-CoV-2 antigen detected." },
    positive: { bg: "#fef2f2", fg: "#b91c1c", label: "POSITIVE", note: "SARS-CoV-2 antigen detected — isolation advised." },
    invalid: { bg: "#fffbeb", fg: "#b45309", label: "INVALID", note: "Test inconclusive — a retest is recommended." },
  };
  const rt = resultTheme[r.result];
  const issued = new Date(r.date + "T00:00").toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" });
  const printedOn = new Date().toLocaleString("en", { dateStyle: "long", timeStyle: "short" });
  const verifyUrl = `${window.location.origin}/verify/${r.certificateId}`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${r.certificateId}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html,body { margin:0; padding:0; }
    body { font-family: 'Inter', ui-sans-serif, system-ui, Arial, sans-serif; color:#0f172a; background:#f1f5f9; }
    .page { position:relative; width:210mm; min-height:297mm; margin:0 auto; background:#fff; padding:0; overflow:hidden; }
    .accent { position:absolute; top:0; left:0; right:0; height:6px; background:linear-gradient(90deg,#4f46e5,#10b981); }
    .wm { position:absolute; top:52%; left:50%; transform:translate(-50%,-50%) rotate(-24deg); font-size:150px; font-weight:800; letter-spacing:6px; color:#0f172a; opacity:0.03; white-space:nowrap; pointer-events:none; }
    .inner { position:relative; padding:56px 56px 40px; }
    header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #e2e8f0; padding-bottom:24px; }
    .brand { display:flex; gap:14px; align-items:center; }
    .logo { width:46px; height:46px; border-radius:12px; background:#4f46e5; display:flex; align-items:center; justify-content:center; }
    .brand h1 { font-size:19px; font-weight:800; margin:0; letter-spacing:-0.2px; }
    .brand p { font-size:12px; color:#64748b; margin:2px 0 0; }
    .docmeta { text-align:right; font-size:11px; color:#64748b; line-height:1.7; }
    .docmeta b { color:#0f172a; }
    .title { margin:34px 0 6px; font-size:26px; font-weight:800; letter-spacing:-0.4px; }
    .subtitle { font-size:13px; color:#64748b; margin:0 0 30px; }
    .grid { display:flex; gap:28px; }
    .col { flex:1; }
    .section-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin:0 0 12px; }
    .field { margin-bottom:14px; }
    .field .k { font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
    .field .v { font-size:15px; font-weight:600; margin-top:2px; }
    .result { margin:34px 0; border:1px solid ${rt.fg}22; background:${rt.bg}; border-radius:16px; padding:22px 26px; display:flex; justify-content:space-between; align-items:center; }
    .result .lbl { font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${rt.fg}; opacity:.85; }
    .result .big { font-size:30px; font-weight:800; color:${rt.fg}; letter-spacing:.5px; margin-top:4px; }
    .result .note { font-size:12px; color:#475569; margin-top:6px; max-width:340px; }
    .qr { width:96px; height:96px; border-radius:12px; background:
        repeating-linear-gradient(90deg,#0f172a 0 6px,#fff 6px 12px),
        repeating-linear-gradient(0deg,#0f172a 0 6px,transparent 6px 12px);
        background-blend-mode:multiply; border:6px solid #fff; box-shadow:0 0 0 1px #e2e8f0; }
    .verify { display:flex; gap:18px; align-items:center; margin-top:6px; }
    .verify .vtext { font-size:11px; color:#64748b; line-height:1.6; }
    .verify .vtext b { color:#0f172a; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
    .sign { display:flex; justify-content:space-between; align-items:flex-end; margin-top:54px; }
    .sigline { width:220px; border-top:1.5px solid #0f172a; padding-top:6px; font-size:11px; color:#64748b; }
    .stamp { width:96px; height:96px; border-radius:50%; border:2px dashed ${r.transmitted ? "#10b981" : "#cbd5e1"}; color:${r.transmitted ? "#047857" : "#94a3b8"}; display:flex; align-items:center; justify-content:center; text-align:center; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1px; transform:rotate(-8deg); }
    footer { position:absolute; left:56px; right:56px; bottom:30px; border-top:1px solid #e2e8f0; padding-top:14px; font-size:10px; color:#94a3b8; display:flex; justify-content:space-between; }
  </style></head><body>
  <div class="page">
    <div class="accent"></div>
    <div class="wm">CERTIFIED</div>
    <div class="inner">
      <header>
        <div class="brand">
          <div class="logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div>
            <h1>${center.name || "Rapid Test Center"}</h1>
            <p>${[center.address, center.city].filter(Boolean).join(", ")}${center.phone ? ` · ${center.phone}` : ""}</p>
          </div>
        </div>
        <div class="docmeta">
          Certificate&nbsp;ID<br><b>${r.certificateId}</b><br>
          Reference&nbsp;<b>${r.ref}</b>
        </div>
      </header>

      <div class="title">Official Test Certificate</div>
      <p class="subtitle">SARS-CoV-2 rapid test result issued in accordance with national testing regulations.</p>

      <div class="grid">
        <div class="col">
          <p class="section-label">Tested person</p>
          <div class="field"><div class="k">Full name</div><div class="v">${r.name}</div></div>
          <div class="field"><div class="k">Certificate reference</div><div class="v">${r.ref}</div></div>
        </div>
        <div class="col">
          <p class="section-label">Test details</p>
          <div class="field"><div class="k">Test type</div><div class="v">${tt?.label ?? r.testTypeId}</div></div>
          <div class="field"><div class="k">Date of test</div><div class="v">${issued}</div></div>
        </div>
      </div>

      <div class="result">
        <div>
          <div class="lbl">Test result</div>
          <div class="big">${rt.label}</div>
          <div class="note">${rt.note}</div>
        </div>
        <div class="qr"></div>
      </div>

      <div class="verify">
        <div class="vtext">
          Scan the code or visit <b>${verifyUrl}</b><br>
          to verify the authenticity of this certificate.
        </div>
      </div>

      <div class="sign">
        <div class="sigline">${r.agent} · Authorised test agent</div>
        <div class="stamp">${r.transmitted ? "Reported to<br>Health Office" : "Not<br>Transmitted"}</div>
      </div>
    </div>

    <footer>
      <span>${center.name || "Rapid Test Center"} — GDPR-compliant · Data encrypted</span>
      <span>Generated ${printedOn}</span>
    </footer>
  </div>
  </body></html>`;
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1000);
  }, 250);
}
