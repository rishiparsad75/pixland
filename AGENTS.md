# PixLand — Agent Instructions

> Mirrored as AGENTS.md, CLAUDE.md, GEMINI.md for any AI environment.

## 3-Layer Architecture

**Layer 1 — Directives** (`directives/`) — SOPs in Markdown. What to do.  
**Layer 2 — Orchestration** — You (the AI). Read directives, call scripts, handle errors.  
**Layer 3 — Execution** (`execution/`) — Deterministic Python scripts. How to do it.

## Key Directives

| Directive | Purpose |
|-----------|---------|
| [`directives/start_local.md`](directives/start_local.md) | Start all 3 services locally |
| [`directives/face_recognition.md`](directives/face_recognition.md) | Face recognition pipeline explained |
| [`directives/deploy_azure.md`](directives/deploy_azure.md) | Azure deployment guide |

## Key Execution Scripts

| Script | Purpose |
|--------|---------|
| `execution/check_health.py` | Verify all 3 services are running |
| `execution/reindex_faces.py` | Re-index all DB photos through ArcFace |
| `server/face_service/warm_up.py` | Warm up ArcFace model cold start |
| `server/face_service/test_api.py` | API end-to-end tests |

## Project Structure

```
face_auth_app/
├── client/          # React + Vite frontend (port 5173)
├── server/          # Node.js + Express API (port 5000)
│   ├── face_service/   # Python Flask + ArcFace (port 5001)
│   └── src/
│       ├── routes/     # API endpoints
│       ├── services/   # faceService.js, blobService.js, etc.
│       └── models/     # MongoDB schemas
├── directives/      # SOPs (what to do)
├── execution/       # Python scripts (how to do it)
└── AGENTS.md        # This file
```

## Operating Principles

1. **Check `execution/` first** before writing new scripts
2. **Self-anneal** — fix errors, update directives, re-test
3. **Never ask about paid operations** without user approval
4. **Deterministic > LLM** — push logic into Python scripts

## Service URLs (Local Dev)

| Service | URL |
|---------|-----|
| React Frontend | http://localhost:5173 |
| Node.js API | http://localhost:5000 |
| Python Face Service | http://localhost:5001 |

## CRITICAL: Start Order

Always start services in this order:
1. Python Face Service (`python server/face_service/app.py`)
2. Node.js API (`cd server && npm run dev`)
3. React Client (`cd client && npm run dev`)
