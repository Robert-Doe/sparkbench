"""
Module 01 lab server.

Runs TWO origins out of one process so you can watch the Same-Origin Policy
(SOP) block a cross-origin request live, in your own DevTools:

    Site A (the "app you're logged into")  -> http://127.0.0.1:5000
    Site B (a different origin)            -> http://127.0.0.1:5001

Same scheme, same host, DIFFERENT PORT = different origin. That port
difference is the entire lesson: origin = scheme + host + port, all three,
exactly. Change any one of them and you've left the origin.

Both servers bind to 127.0.0.1 ONLY. See ../SAFETY.md.
"""
import threading
from pathlib import Path

from flask import Flask, jsonify, send_from_directory

BASE = Path(__file__).parent

site_a = Flask("site_a")
site_b = Flask("site_b")


# ---------------------------------------------------------------- Site A ---
@site_a.route("/")
def index():
    return send_from_directory(BASE, "index.html")


@site_a.route("/devtools-guide")
def devtools_guide():
    return send_from_directory(BASE, "devtools_guide.html")


@site_a.route("/tutorial")
def tutorial():
    return send_from_directory(BASE, "tutorial.html")


@site_a.route("/secret")
def site_a_secret():
    # Pretend this is data that belongs to a logged-in user of Site A.
    return jsonify(
        {
            "origin": "http://127.0.0.1:5000",
            "balance": "$4,213.00",
            "note": "If code running on :5001 can read this, SOP is broken.",
        }
    )


# ---------------------------------------------------------------- Site B ---
@site_b.route("/")
def site_b_index():
    return (
        "<h1>Site B</h1>"
        "<p>This stands in for a completely unrelated website. It happens "
        "to run on your machine for lab convenience, but as far as the "
        "browser is concerned it is a different origin from Site A because "
        "the port (5001 vs 5000) differs.</p>"
    )


@site_b.route("/secret")
def site_b_secret():
    return jsonify(
        {
            "origin": "http://127.0.0.1:5001",
            "note": "This is Site B's own data. Site A's JS should not be "
            "able to read this either, without an explicit CORS grant.",
        }
    )


def run_a():
    site_a.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)


def run_b():
    site_b.run(host="127.0.0.1", port=5001, debug=False, use_reloader=False)


if __name__ == "__main__":
    t = threading.Thread(target=run_b, daemon=True)
    t.start()

    print("=" * 64)
    print(" Module 01 lab is up.")
    print(" Site A (main app) : http://127.0.0.1:5000")
    print(" Site B (other origin) : http://127.0.0.1:5001")
    print(" Open Site A in your browser and follow /tutorial")
    print("=" * 64)

    run_a()
