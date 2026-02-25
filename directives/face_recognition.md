---
description: How face recognition works in PixLand end-to-end
---

## Architecture
```
Browser (Selfie JPEG)
    ↓  POST /api/face/identify (multipart)
Node.js API (port 5000)
    ↓  POST http://localhost:5001/extract (base64)
Python Flask (port 5001) — DeepFace ArcFace
    ↓  512D L2-normalized embedding
Node.js — cosine similarity vs all DB images
    ↓
Matched images returned to browser
```

## Thresholds (ArcFace Calibrated)
| Cosine Similarity | Confidence |
|-------------------|-----------|
| > 0.65 | High match |
| 0.55–0.65 | Medium match |
| 0.45–0.55 | Low match |
| ≤ 0.45 | No match |

## Key Files
| File | Role |
|------|------|
| `server/face_service/app.py` | Flask: `/extract`, `/compare`, `/health` |
| `server/src/services/faceService.js` | Node.js → Python bridge |
| `server/src/routes/faceRoute.js` | `/identify` (selfie→match), `/match` (descriptor→match) |
| `server/src/routes/uploadRoute.js` | Photo upload → Python extraction → MongoDB |
| `client/src/pages/FaceScan.jsx` | UI: captures webcam JPEG → POST /identify |

## Testing Face Recognition
1. Run `execution/check_health.py` — verify all services up
2. Run `execution/test_extract.py` — end-to-end extraction test
3. Upload a photo via UI → check DB for descriptor array
4. Scan face → verify matched photo returns

## Common Errors
| Error | Cause | Fix |
|-------|-------|-----|
| `NO_FACE_DETECTED` | Poor lighting or no face | Better lighting, face centered |
| `ECONNREFUSED 5001` | Python service down | `python app.py` in face_service/ |
| Timeout >90s | Cold start (first run) | Wait, retry — model caches |
| Similarity always 0.45–0.5 | Stale face-api.js descriptors in DB | Re-index with `execution/reindex_faces.py` |

## IMPORTANT: Re-indexing Old Photos
If DB has old face-api.js descriptors (128D), they WON'T match ArcFace (512D).
Run: `python execution/reindex_faces.py`
This re-processes all photos through ArcFace and updates the DB.
