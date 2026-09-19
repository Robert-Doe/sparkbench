# sparkbench webapp

A small, real, publicly-hostable demo matching sparkbench's actual scope:
this repository is the early, single-module prototype of what became the
19-module **breachlab** course, and this webapp is scoped the same way —
one classic XSS execution mechanism (script-tag / event-handler
injection), not the full five-mechanism suite.

**This is intentionally a safe, client-only reimplementation, distinct
from the original local Flask lab in `module-01-environment-setup/`.**
That module runs a real local Flask server (`lab_server.py`) meant for
offline, localhost-only use demonstrating the same-origin policy, and is
unchanged by this webapp. This `webapp/` demo ships **zero** backend
code: the "vulnerable" sink is reimplemented in the browser and executed
inside a sandboxed `<iframe sandbox="allow-scripts">` (without
`allow-same-origin`) fed via `srcdoc`, so a payload can genuinely fire
while touching nothing real — no server, no database, no shared state
between visitors, no persistence of any kind.

For the completed, five-mechanism version of this playground, see the
sibling project [breachlab](https://github.com/Robert-Doe/breachlab),
which this webapp links to directly.

## Local development

```bash
cd webapp
npm install
npm run dev
```

## Production build

```bash
cd webapp
npm run build
```

Output goes to `webapp/dist/`. The build must complete with zero errors.

## Static hosting (Vercel / Netlify / Cloudflare Pages)

This is a static site — no server, no environment variables, no functions.

| Setting | Value |
|---|---|
| Root directory | `webapp` |
| Build command | `npm run build` |
| Output directory | `dist` |

That's it — point any static host at the `webapp` subdirectory with those
three settings and it will deploy.

## Safety notes

- No backend, no API route, no database anywhere in this directory.
- All payload execution happens inside a sandboxed, cross-origin-opaque
  `<iframe>` with no access to this page's real cookies, storage, or DOM.
- Nothing typed into the playground is ever sent to a server, stored, or
  shown to any other visitor — it exists only in this browser tab, for
  the duration of one page load.
