# -*- coding: utf-8 -*-
"""
execution/reindex_faces.py
===========================
Re-processes ALL existing DB images through Python ArcFace microservice.
Directly connects to MongoDB — no API token needed.

Usage:
  1. Start Python face service:  python server/face_service/app.py
  2. Run:  python execution/reindex_faces.py

Requirements: pip install pymongo requests pillow
"""

import sys, io, os, requests, base64, time
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── Load .env from server/.env ─────────────────────────────────────────────
env_path = Path(__file__).parent.parent / "server" / ".env"
print(f"Loading .env from: {env_path}")
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())
else:
    print("[WARN] .env not found, using defaults")

MONGO_URI        = os.environ.get("MONGO_URI", "")
FACE_SERVICE_URL = os.environ.get("FACE_SERVICE_URL", "http://localhost:5001")

if not MONGO_URI:
    print("[FAIL] MONGO_URI not set in server/.env")
    sys.exit(1)

# ── Connect MongoDB ─────────────────────────────────────────────────────────
try:
    from pymongo import MongoClient
    from bson import ObjectId
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    client.admin.command('ping')
    # Get the database name from URI
    db_name = MONGO_URI.rstrip('/').split('/')[-1].split('?')[0] or "pixland"
    db = client[db_name]
    images_col = db["images"]
    print(f"[OK] MongoDB connected — db: {db_name}")
except Exception as e:
    print(f"[FAIL] MongoDB connection failed: {e}")
    print("  Install pymongo: pip install pymongo")
    sys.exit(1)

# ── Verify Face Service ─────────────────────────────────────────────────────
try:
    r = requests.get(f"{FACE_SERVICE_URL}/health", timeout=5)
    d = r.json()
    print(f"[OK] Face service: {d.get('model')} + {d.get('detector')}")
except Exception as e:
    print(f"[FAIL] Face service not reachable: {e}")
    print("  Start it: python server/face_service/app.py")
    sys.exit(1)

# ── Fetch all images from DB ────────────────────────────────────────────────
total = images_col.count_documents({})
print(f"\n[INFO] Found {total} images in DB")
print("       Starting re-index through ArcFace...\n")

success = 0
failed  = 0
no_face = 0
skipped = 0

cursor = images_col.find({}, {"_id": 1, "url": 1, "blobName": 1, "metadata": 1})

for i, img in enumerate(cursor, 1):
    img_id = img["_id"]
    url    = img.get("url", "")

    if not url:
        skipped += 1
        continue

    # Check if already has 512D ArcFace descriptor
    faces = img.get("metadata", {}).get("detectedFaces", [])
    if faces and faces[0].get("descriptor") and len(faces[0]["descriptor"]) == 512:
        print(f"  [{i}/{total}] SKIP (already 512D ArcFace) — {url[-50:]}")
        skipped += 1
        continue

    try:
        # Download image
        img_resp = requests.get(url, timeout=20)
        if img_resp.status_code != 200:
            print(f"  [{i}/{total}] FAIL download HTTP {img_resp.status_code} — {url[-50:]}")
            failed += 1
            continue

        # Send to ArcFace /extract
        b64 = base64.b64encode(img_resp.content).decode("utf-8")
        extract_resp = requests.post(
            f"{FACE_SERVICE_URL}/extract",
            json={"image": b64},
            timeout=90
        )

        if extract_resp.status_code == 200:
            data       = extract_resp.json()
            embedding  = data.get("embedding", [])
            face_area  = data.get("face_area", {})

            # Normalize face_area keys to match existing schema
            face_rect = {
                "top":    face_area.get("y", 0),
                "left":   face_area.get("x", 0),
                "width":  face_area.get("w", 0),
                "height": face_area.get("h", 0),
            }

            # Update MongoDB directly
            images_col.update_one(
                {"_id": img_id},
                {"$set": {
                    "metadata.detectedFaces": [{
                        "descriptor":    embedding,
                        "faceRectangle": face_rect,
                        "indexed":       True
                    }],
                    "status":       "ready",
                }}
            )
            print(f"  [{i}/{total}] OK   {len(embedding)}D — {url[-50:]}")
            success += 1

        elif extract_resp.status_code == 422:
            # No face in photo — clear old bad descriptor
            images_col.update_one(
                {"_id": img_id},
                {"$set": {
                    "metadata.detectedFaces": [],
                    "status": "ready"
                }}
            )
            print(f"  [{i}/{total}] NO_FACE — {url[-50:]}")
            no_face += 1

        else:
            print(f"  [{i}/{total}] FAIL extract HTTP {extract_resp.status_code}")
            failed += 1

        time.sleep(0.3)  # slight pause to not overwhelm service

    except requests.exceptions.Timeout:
        print(f"  [{i}/{total}] TIMEOUT — {url[-50:]}")
        failed += 1
    except Exception as e:
        print(f"  [{i}/{total}] ERROR — {e}")
        failed += 1

print(f"""
=== Re-index Complete ===
  Updated (512D ArcFace):  {success}
  No face detected:        {no_face}
  Already indexed (skip):  {skipped}
  Failed:                  {failed}
  Total:                   {total}
========================
""")
print("Now try face scanning — all processed photos should match!")
