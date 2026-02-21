const express = require("express");
const multer = require("multer");
const { uploadToBlob } = require("../services/blobService");
const { protect, photographer } = require("../middleware/authMiddleware");
const Image = require("../models/Image");
const Event = require("../models/Event");
const { detectAndExtractDescriptors } = require("../services/faceService");


const router = express.Router();


const upload = multer({
  storage: multer.memoryStorage(),
});


router.post("/", protect, photographer, upload.array("images", 50), async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // ─── Upload Quota Check ───
    const User = require("../models/User");
    const uploader = await User.findById(req.user._id);
    const isPro = uploader?.subscription?.plan === 'premium' && uploader?.subscription?.status === 'active';

    if (!isPro) {
      const uploadLimit = uploader?.usage?.uploads?.monthlyLimit || 100;
      const currentUploads = uploader?.usage?.uploads?.count || 0;
      const spaceLeft = uploadLimit - currentUploads;

      if (spaceLeft <= 0) {
        return res.status(403).json({ error: `Monthly upload limit reached (${uploadLimit} uploads/month). Upgrade to Pro for unlimited uploads.` });
      }

      // Trim files if they exceed remaining quota
      if (req.files.length > spaceLeft) {
        req.files = req.files.slice(0, spaceLeft);
      }

      // Increment count
      await User.findByIdAndUpdate(req.user._id, { $inc: { "usage.uploads.count": req.files.length } });
    }

    const uploadPromises = req.files.map(async (file) => {
      // 1. Upload to Blob Storage
      const imageUrl = await uploadToBlob(file);

      // 2. Detect & Extract Face Descriptors
      let faceDetails = [];
      try {
        // Pass the buffer instead of URL to avoid canvas fetching issues
        const results = await detectAndExtractDescriptors(file.buffer);
        faceDetails = results.map(r => ({
          descriptor: r.descriptor,
          faceRectangle: r.faceRectangle
        }));
      } catch (faceError) {

        console.error(`Face extraction failed for ${file.originalname}:`, faceError);
      }

      // 3. Save to Database
      return await Image.create({
        user: req.user._id,
        event: eventId,
        url: imageUrl,
        blobName: file.originalname,
        metadata: {
          detectedFaces: faceDetails
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
