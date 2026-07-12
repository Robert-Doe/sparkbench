# Design Decisions — Module 01

Notes on *why* this module's lab code is built the way it is, separate from
the security concepts themselves (those are in `headfirst.md`).

## Why two Flask apps in one process, instead of two separate scripts

A real SOP demo needs two genuinely different origins running
simultaneously, with zero setup friction. Two separate `python` invocations
in two terminals works too, but it doubles the "did you remember to start
both" failure mode for a first-week student. Running Site B in a daemon
thread inside `lab_server.py` means one command (`python lab_server.py`)
guarantees both origins are up before the printed URLs even appear. The
tradeoff — both servers die together, and you can't restart one
independently — doesn't matter for a demo whose entire lifetime is one
sitting.

## Why 127.0.0.1 and not 0.0.0.0

`0.0.0.0` binds to every network interface, including your LAN-facing one —
on a home network, other devices on the same Wi-Fi (and depending on router
config, sometimes beyond it) could reach an app bound that way. Every
server in this course, including future modules' intentionally-vulnerable
ones, binds to `127.0.0.1` only, so the blast radius of "I left a
vulnerable Flask app running" is exactly zero. See `../SAFETY.md`. This is
a hard rule for the whole course, not just this module — don't change it in
later modules either, even when it'd be more "realistic" to bind wider.

## Why ports 5000/5001 specifically

5000 is Flask's traditional default, so it's the port most tutorials and
your own instincts will expect for "the app." 5001 is arbitrary — any
different port proves the point. They were chosen adjacent only for
memorability, not for any technical reason.

## Why no vulnerability yet in Module 01

Module 01 has no injectable parameter anywhere. This is deliberate sequencing:
you need the mental model of origins and DevTools fluency *before* Module 02
starts showing you how the HTML parser recovers from malformed input, and
before Module 04 gives you the first real injection point. Introducing a
vulnerability this early would let a student "solve" it accidentally,
without understanding the mechanism — which defeats the attack-first,
understand-why pedagogy the whole course is built on.

## Why Flask over a raw `http.server` or Node/Express

Flask keeps the code short enough to read in full inside this file's sibling
`lab_server.py` (under 100 lines including comments) while still giving
later modules real request/response objects, template rendering, and a
session/cookie API — all needed from Module 04 onward. Introducing the
framework now, when the code has nothing scary in it, means Module 04's
diff against this file is small and legible.

## Why `send_from_directory` instead of Flask's `render_template`

`render_template` implies a `templates/` folder and Jinja2 autoescaping,
which is itself a defense mechanism (Module 17 territory). Module 01's
pages are static — no server-side templating happens yet — so
`send_from_directory` is the honest choice: it says "this file is served
byte-for-byte," with no implicit escaping behavior to explain prematurely.
