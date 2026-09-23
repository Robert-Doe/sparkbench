import "./style.css";

/**
 * Sparkbench, Early XSS Lab Prototype
 *
 * sparkbench is the historical first draft of what became the 19-module
 * breachlab course, only Module 01 (environment setup / same-origin
 * policy) was ever built here before development continued in the
 * sibling repository, breachlab. This webapp mirrors that scope
 * honestly: it's a small, single-mechanism playground, not the full
 * five-mechanism suite.
 *
 * Like breachlab's webapp, this is a safe, 100% client-side
 * reimplementation. There is no backend. The "vulnerable" sink below
 * runs inside a sandboxed <iframe sandbox="allow-scripts"> (deliberately
 * WITHOUT allow-same-origin) fed via `srcdoc`, so a payload can genuinely
 * execute while touching nothing real, no real cookies, no real
 * storage, no other visitor. Execution is only observable because the
 * sandboxed frame chooses to `postMessage` a report back to this page.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Tiny reporting shim, same pattern as breachlab: overrides alert/confirm/
// prompt so a fired payload reports back instead of opening a real dialog.
const HARNESS_SCRIPT = `<script>
(function () {
  function report(via, detail) {
    try {
      top.postMessage({ __sparkbench: true, status: "fired", via: via, detail: String(detail).slice(0, 200) }, "*");
    } catch (e) {}
  }
  window.alert = function (msg) { report("alert", msg); };
  window.confirm = function (msg) { report("confirm", msg); return true; };
  window.prompt = function (msg) { report("prompt", msg); return null; };
})();
<\/script>`;

const DEFAULT_PAYLOAD = "<img src=x onerror=\"alert('sparkbench:fired')\">";

let hardened = false;
let payloadOverride: string | null = null;
let runToken = 0;

function currentPayload(): string {
  return payloadOverride ?? DEFAULT_PAYLOAD;
}

const app = document.getElementById("app")!;

function sinkCode(payload: string): string {
  return (
    `# Illustrative vulnerable pattern, a typical "search results" page\n` +
    `# reflecting user input straight into the HTML body, unescaped.\n` +
    `# (sparkbench only ever built Module 01 / environment setup, this\n` +
    `#  exact injection lab was never implemented here; the finished,\n` +
    `#  five-mechanism version lives in breachlab, Module 04 onward.)\n\n` +
    `q = request.args.get("q", "")\n` +
    `body = f'<div id="results">Results for: {q}</div>'   # no escaping\n\n` +
    `# live payload:\n# q = ${JSON.stringify(payload)}`
  );
}

function render() {
  app.innerHTML = `
    <header class="topbar">
      <div class="brand"><span class="dot"></span>sparkbench</div>
      <div class="links">
        <a href="https://github.com/Robert-Doe/sparkbench" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://robertdoe.com" target="_blank" rel="noopener noreferrer">&larr; robertdoe.com</a>
      </div>
    </header>

    <section class="hero">
      <span class="eyebrow">Sandboxed &middot; Client-Only &middot; No Backend</span>
      <h1>Sparkbench<br />Early XSS Lab Prototype</h1>
      <p class="tagline">
        The first-draft scratch build of the curriculum that became <strong>breachlab</strong>.
        Only Module 01 (environment setup) was ever finished here, so this demo is scoped
        to match: one execution mechanism, running live in a sandbox that can't touch
        anything real.
      </p>
      <div class="safety-banner">
        <span class="icon">[!]</span>
        <div>
          <strong>Authorized, sandboxed, client-side lab.</strong>
          The "vulnerable" page below runs inside an
          <code style="font-family:var(--mono)">&lt;iframe sandbox="allow-scripts"&gt;</code>
          with no <code style="font-family:var(--mono)">allow-same-origin</code>, loaded via
          <code style="font-family:var(--mono)">srcdoc</code>. Nothing you type is sent to a
          server, stored, or shown to anyone else.
        </div>
      </div>
      <div class="proto-banner">
        <strong>This is the early prototype, not the finished course.</strong>
        sparkbench stopped at Module 01 before development moved to the completed,
        19-module sibling project, <a href="https://github.com/Robert-Doe/breachlab" target="_blank" rel="noopener noreferrer">breachlab</a>,
        which covers all five XSS execution mechanisms with a matching sandboxed playground.
      </div>
    </section>

    <main class="demo">
      <div class="card">
        <span class="module-ref">Illustrative, classic tag/event-handler injection</span>
        <h2>Script-Tag &amp; Event-Handler Injection</h2>
        <p>
          When user input is dropped straight into an HTML page with no escaping, the
          browser's parser can't tell the difference between "content" and "a new tag or
          attribute." A classic payload like an <code style="font-family:var(--mono)">&lt;img&gt;</code>
          with a broken <code style="font-family:var(--mono)">src</code> and an
          <code style="font-family:var(--mono)">onerror</code> handler runs attacker
          JavaScript the instant the browser tries (and fails) to load the image, no
          <code style="font-family:var(--mono)">&lt;script&gt;</code> tag required.
        </p>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="panel-label">Vulnerable sink (illustrative)</div>
          <div class="code-panel" id="sink-code"></div>
        </div>
        <div class="card">
          <div class="panel-label">
            <span>Sandboxed output</span>
            <span class="status-badge idle" id="status-badge">idle</span>
          </div>
          <div class="output-frame-wrap">
            <iframe id="output-frame" sandbox="allow-scripts" srcdoc=""></iframe>
            <div class="log-line" id="log-line">Press Run to inject the payload into the sandbox.</div>
          </div>
        </div>
      </div>

      <div class="card">
        <label class="harden-toggle" id="harden-toggle">
          <span class="switch ${hardened ? "on" : ""}"></span>
          <span><strong>Harden this sink</strong>, HTML-entity-encode before insertion</span>
        </label>

        <div class="payload-row">
          <input class="payload-input" id="payload-input" type="text" spellcheck="false" value="${escapeHtml(currentPayload())}" />
          <button class="btn secondary" id="reset-btn">Reset payload</button>
          <button class="btn" id="run-btn">Run ▶</button>
        </div>
        <p class="hint">
          Edit the payload freely, it only ever runs inside the sandboxed frame above.
          Toggle "harden this sink" and run the same payload again to see it neutralised.
        </p>
      </div>
    </main>

    <footer class="site-footer">
      <p class="footer-safety">
        This is an authorized, sandboxed, 100% client-side educational demo. No payload is ever
        sent to a server, persisted, or relayed to any other visitor.
      </p>
      <div class="footer-meta">
        sparkbench, early prototype (Module 01 only) &middot;
        full course: <a href="https://github.com/Robert-Doe/breachlab" target="_blank" rel="noopener noreferrer">breachlab</a>
      </div>
    </footer>
  `;

  document.getElementById("sink-code")!.textContent = sinkCode(currentPayload());
  wireEvents();
}

function setStatus(status: "idle" | "fired" | "blocked", message: string) {
  const badge = document.getElementById("status-badge")!;
  const log = document.getElementById("log-line")!;
  badge.className = `status-badge ${status}`;
  badge.textContent = status;
  log.className = `log-line ${status === "idle" ? "" : status}`;
  log.textContent = message;
}

function wireEvents() {
  document.getElementById("harden-toggle")!.addEventListener("click", () => {
    hardened = !hardened;
    render();
  });

  const input = document.getElementById("payload-input") as HTMLInputElement;
  input.addEventListener("input", () => {
    payloadOverride = input.value;
    document.getElementById("sink-code")!.textContent = sinkCode(currentPayload());
  });

  document.getElementById("reset-btn")!.addEventListener("click", () => {
    payloadOverride = null;
    render();
  });

  document.getElementById("run-btn")!.addEventListener("click", runPayload);
}

function runPayload() {
  const payload = currentPayload();
  const token = ++runToken;

  setStatus("idle", "Running…");

  const iframe = document.getElementById("output-frame") as HTMLIFrameElement;
  const content = hardened ? escapeHtml(payload) : payload;
  const srcdoc = `<!doctype html><html><head><meta charset="utf-8">${HARNESS_SCRIPT}</head><body style="font-family:sans-serif;font-size:13px;padding:10px;color:#111"><div id="results">Results for: ${content}</div></body></html>`;

  const listener = (event: MessageEvent) => {
    if (token !== runToken) return;
    const data = event.data;
    if (data && typeof data === "object" && data.__sparkbench && data.status === "fired") {
      window.removeEventListener("message", listener);
      setStatus("fired", `Fired via ${data.via}("${data.detail}"), the payload executed inside the sandbox.`);
    }
  };
  window.addEventListener("message", listener);

  iframe.srcdoc = srcdoc;

  window.setTimeout(() => {
    if (token !== runToken) return;
    const badge = document.getElementById("status-badge");
    if (badge && badge.textContent === "idle") {
      setStatus(
        "blocked",
        hardened
          ? "Blocked, the hardening transform neutralised this payload."
          : "No execution detected, this payload didn't trigger alert/confirm/prompt."
      );
    }
  }, 900);
}

render();
