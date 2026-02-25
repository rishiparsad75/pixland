---
description: How to deploy PixLand to Azure (backend + frontend + Python service)
---

## Services to Deploy
1. **Azure App Service** — Node.js backend
2. **Azure Static Web Apps** — React frontend  
3. **Azure App Service (Linux)** — Python face service OR Azure Container

## Pre-Deployment Checklist
- [ ] `.env` vars set in Azure App Service → Configuration
- [ ] `FACE_SERVICE_URL` set to Python service URL (not localhost)
- [ ] `VITE_API_URL` set in Static Web App environment vars
- [ ] MongoDB Atlas IP whitelist includes Azure outbound IPs

## Key Environment Variables
```env
# Node.js App Service
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
FACE_SERVICE_URL=https://pixland-face-service.azurewebsites.net
AZURE_STORAGE_CONNECTION_STRING=...
FRONTEND_URL=https://www.pixland.tech

# Python Face Service
FACE_SERVICE_PORT=8000  # Azure uses 8000, not 5001
```

## Python Service Deployment
Option A — Azure App Service (Linux):
- Runtime: Python 3.10
- Startup command: `gunicorn -w 2 -b 0.0.0.0:8000 app:app --timeout 120`
- Note: First request will be slow (model download). Pre-warm with `/health`.

Option B — Docker Container:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8000", "app:app", "--timeout", "120"]
```

## Common Deployment Issues
| Error | Fix |
|-------|-----|
| 503 on face service | Cold start — hit `/health` to warm up |
| CORS error | Add frontend URL to Node.js `corsOptions` |
| MongoDB SRV DNS fail | DNS set to 8.8.8.8 (already in index.js) |
