# Face AI Models Setup

To make face recognition work, you need to download the following models and place them in both:
- `client/public/models/`
- `server/models/`

## Files to Download
Download these files from the [official face-api.js weights repo](https://github.com/vladmandic/face-api/tree/master/model):

1. **SSD MobileNet V1 (Detection)**
   - `ssd_mobilenetv1_model-weights_manifest.json`
   - `ssd_mobilenetv1_model-shard1`

2. **Face Landmark 68 (Landmarks)**
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`

3. **Face Recognition (Embeddings)**
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`

## Easy Way
You can run this command if you have `curl` or `wget`:
```bash
# Example for one file
curl -L https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenetv1_model-weights_manifest.json -o ssd_mobilenetv1_model-weights_manifest.json
```
Alternatively, I can try to script the download if needed, but usually manual download is safer on Windows.
