---
description: Start all PixLand services locally for development
---

## Overview
PixLand uses a 3-service architecture:
1. **Python Face Service** (port 5001) — DeepFace/ArcFace embedding microservice
2. **Node.js API** (port 5000) — Main backend, DB, routes
3. **React Client** (port 5173) — Frontend (Vite)

## Steps

### 1. Start Python Face Service
```bash
cd server/face_service
python app.py
```
Expected output: `[Startup] PixLand Face Service starting on port 5001`  
Wait for the Flask server line before moving on.

> **IMPORTANT**: Start this FIRST. Node.js checks face service health at startup. If not running, image uploads will fail silently.

### 2. Start Node.js API
```bash
cd server
npm run dev
```
Expected: `[Startup] PixLand Backend running on port 5000`

### 3. Start React Client
```bash
cd client
npm run dev
```
Expected: `VITE ready in Xms — http://localhost:5173`

## Verification
Run `execution/check_health.py` to verify all 3 services are responding:
```bash
python execution/check_health.py
```

## Common Issues
| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` on upload | Python service not running — start it first |
| Model takes 60s first upload | Normal — ArcFace downloading weights on cold start |
| Port 5001 already in use | `taskkill /F /IM python.exe` then restart |
| `npm run dev` fails (PS policy) | Use `cmd /c "npm run dev"` instead |
