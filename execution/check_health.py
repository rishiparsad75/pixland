# -*- coding: utf-8 -*-
"""
execution/check_health.py
==========================
Checks all 3 PixLand services are running and healthy.
Run this before starting any development to confirm the system is up.

Usage: python execution/check_health.py
"""
import sys, io, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SERVICES = {
    "Python Face Service (port 5001)": "http://localhost:5001/health",
    "Node.js API (port 5000)":         "http://localhost:5000/api/health",
    "React Client (port 5173)":        "http://localhost:5173",
}

print("")
print("=== PixLand Service Health Check ===")
print("")

all_ok = True
for name, url in SERVICES.items():
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            try:
                d = r.json()
                extra = f"  model={d.get('model', '')}  version={d.get('version', '')}".strip()
            except Exception:
                extra = ""
            print(f"  [OK]   {name}  {extra}")
        else:
            print(f"  [WARN] {name}  HTTP {r.status_code}")
            all_ok = False
    except requests.exceptions.ConnectionError:
        print(f"  [DOWN] {name}  -- NOT RUNNING")
        all_ok = False
    except Exception as e:
        print(f"  [ERR]  {name}  {e}")
        all_ok = False

print("")
if all_ok:
    print("  All services are UP and healthy!")
else:
    print("  Some services are DOWN. See directives/start_local.md to start them.")
print("")
