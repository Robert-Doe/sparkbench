# Safety & Scope

This course teaches offensive web-security techniques (XSS) for the purpose
of building defensive expertise. Read this before running anything.

## Rules that keep this course legal and safe

1. **Everything runs on `127.0.0.1` only.** Every server in this course binds
   to localhost, never `0.0.0.0` or your LAN IP. Don't change that binding.
   A Flask app bound to `0.0.0.0` on a home network is reachable by every
   other device on that network — don't do it.
2. **Never point these payloads at a site you don't own or don't have written
   authorization to test.** Everything you build here is practiced against
   `vuln_*.py` servers running on your own machine. The moment you try a
   technique from this course against a real, third-party site without
   authorization, you've left "PhD security research" and entered
   unauthorized computer access (CFAA in the US, Computer Misuse Act in the
   UK, and equivalents elsewhere).
3. **Don't deploy the vulnerable servers anywhere persistent.** They're
   intentionally broken. That's the point. Treat them like a chemistry lab's
   reagents — useful under controlled conditions, not something you leave
   running on a box facing the internet.
4. **Blind XSS modules (M11) use a callback server you control.** Never point
   blind-XSS payloads at systems you don't own while learning. Later, if you
   do authorized bug-bounty or pentest work, that's a separate engagement
   with its own signed scope — not something this course grants.
5. **If you fork this into real research**, your university's IRB/ethics
   process and responsible-disclosure norms (module 18 covers this) govern
   anything involving real systems or real users — this course does not.

## What's safe by default

- All lab servers listen on localhost.
- No module in this course ever asks you to scan, probe, or send payloads to
  any host other than `127.0.0.1`.
- Sample "victim" data (cookies, balances, tokens) is all synthetic, generated
  by the lab code itself.
