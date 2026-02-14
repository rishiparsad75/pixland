const express = require("express");
const multer = require("multer");
const { uploadToBlob } = require("../services/blobService");
const { protect, photographer } = require("../middleware/authMiddleware");
const Image = require("../models/Image");
const Event = require("../models/Event");
const { detectFaces, addFaceToList, createFaceList } = require("../services/faceService");

const router = express.Router();
const FACE_LIST_ID = "pixland_global_list";

const upload = multer({
  storage: multer.memoryStorage(),
});

// Initialize FaceList
createFaceList(FACE_LIST_ID).catch(console.error);

router.post("/", protect, photographer, upload.array("images", 50), async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = req.files.map(async (file) => {
      // 1. Upload to Blob Storage
      const imageUrl = await uploadToBlob(file);

      // 2. Detect Faces
      let detectedFaces = [];
      let faceDetails = [];
      try {
        detectedFaces = await detectFaces(imageUrl);

        // 3. Add to Global Face List for future searching
        for (const face of detectedFaces) {
          const persistedFaceId = await addFaceToList(FACE_LIST_ID, imageUrl, {
            originalName: file.originalname,
            imageUrl: imageUrl
          });
          faceDetails.push({
            faceId: face.faceId,
            persistedFaceId: persistedFaceId,
            faceRectangle: face.faceRectangle
          });
        }
      } catch (faceError) {
        console.error(`Face detection/indexing failed for ${file.originalname}:`, faceError);
      }

      // 4. Save to Database
      return await Image.create({
        user: req.user._id, // Uploader (Photographer)
        event: eventId,
        url: imageUrl,
        blobName: file.originalname,
        metadata: {
          detectedFaces: faceDetails.length > 0 ? faceDetails : detectedFaces.map(f => ({
            faceId: f.faceId,
            faceRectangle: f.faceRectangle
          }))
        }
      });
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      message: `${results.length} images uploaded and processed successfully`,
      images: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
