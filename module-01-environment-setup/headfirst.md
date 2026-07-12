# Head First: Same-Origin, and Thinking Like an Attacker

## Your browser is running code from strangers, on purpose, right now

Every tab you have open is executing JavaScript written by someone you've
never met, with access to your cookies, your clipboard (sometimes), your
location (if you allowed it), and your screen. This is not a bug. It's the
deal the web made in 1995 and never renegotiated: **pages get to run code,
automatically, the instant you load them.**

XSS — Cross-Site Scripting — is what happens when an attacker gets *their*
code to run with *your* page's permissions instead of their own. That's the
entire subject of this course, stated in one sentence. Everything else is
detail about *how*.

## The one rule standing between chaos and the modern web

If every page's JavaScript could read every other page's cookies, the web
would be unusable in about four minutes. Your bank tab could be read by the
ad-tracker tab. The news site you have open could reach into your webmail.

The rule that prevents this is the **Same-Origin Policy (SOP)**, and it is
almost insultingly simple:

> Script running on origin A cannot read data from origin B, unless B
> explicitly says it's okay.

That's it. That's the whole rule. The complexity is entirely in defining
**"origin"** precisely enough that browsers can enforce it consistently.

## An origin is exactly three things

```
   https://example.com:443/some/page?query=1
   \___/   \_________/ \_/
  scheme      host     port
```

Two URLs are the **same origin** only if scheme, host, AND port all match,
character for character. Not "close enough." Not "same company." Exactly
those three strings, equal.

**Brain power:** before reading further, decide for yourself — are these
pairs the same origin or different?

```
1. http://example.com          vs  https://example.com
2. http://example.com          vs  http://www.example.com
3. http://example.com:80       vs  http://example.com
4. http://127.0.0.1:5000       vs  http://127.0.0.1:5001
```

Answers: **(1) different** — scheme changed, http vs https.
**(2) different** — host changed, `www.` is a different hostname to a browser
even though a human reads it as "the same site."
**(3) same** — port 80 is HTTP's default, so `:80` and no-port mean the
same thing.
**(4) different** — this is the one you just proved with your own eyes in
`lab_server.py`. Same machine, same person (you), same browser — still two
separate origins, because the port differs.

If you got all four right without looking, you already understand the
mental model this entire course builds on. If you got any wrong, that's
normal — go re-run the Module 01 lab and watch the cross-origin fetch fail
again. Watching it fail sticks better than reading about it.

## Why this matters for XSS specifically

XSS is dangerous *because* of SOP, not despite it. Here's the chain:

1. SOP means script from `evil.com` can't read your data on `bank.com`.
2. So an attacker's actual goal is never "run my script on my own page" —
   they already can, and it's worthless, because SOP walls it off.
3. The attacker's real goal is to get **their script executing as if it
   were `bank.com`'s own script** — inside `bank.com`'s origin.
4. Once that happens, SOP doesn't protect you at all. SOP was never
   designed to stop `bank.com`'s own code from reading `bank.com`'s own
   cookies — that's supposed to happen.

**This is the single most important reframe in the entire course:** XSS
isn't "hacking the browser." The browser's security model works exactly as
designed, every single time. XSS is tricking a trusted origin's *server* into
serving the attacker's JavaScript labeled as its own first-party code. The
browser then does exactly what it's supposed to do — execute first-party
script with first-party privileges — except the script isn't really
first-party at all.

Every module from here forward is one specific technique for smuggling
attacker-controlled bytes into a position where the browser will treat them
as if the origin itself wrote them.

## DevTools: stop thinking of it as a debugger

You've probably used DevTools to fix your own broken CSS. For this course,
flip the framing: DevTools is a **read/write console into any page's live
execution state** — yours or anyone else's, subject only to SOP. Console
lets you run arbitrary JS with the page's own privileges. Elements shows you
the actual DOM, not the source text. Network shows you every byte crossing
the wire, headers included, whether or not your JavaScript is allowed to see
it. Sources lets you pause someone else's code mid-execution and inspect
its variables.

An attacker with a real injection point doesn't need DevTools at all — the
payload does the work. But *you*, learning to find and evaluate injection
points, will live in DevTools for the rest of this course. Get fluent now;
Module 02 assumes you can already navigate all five panels without thinking
about it.

## Self-test before moving on

- Explain, out loud, to an imaginary colleague, why `http://127.0.0.1:5000`
  and `http://127.0.0.1:5001` are different origins.
- Explain why an XSS bug is a *server-side* mistake (letting attacker bytes
  into a trusted response) that produces a *client-side* consequence
  (script executing with first-party privilege) — not a flaw in the browser
  itself.
- If you can't answer both cleanly, re-read this file and re-run the lab
  before starting Module 02.
