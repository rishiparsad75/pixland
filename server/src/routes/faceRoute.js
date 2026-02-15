const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { detectFaces, findSimilarFaces } = require("../services/faceService");
const { uploadToBlob } = require("../services/blobService");
const Image = require("../models/Image");

const router = express.Router();
const FACE_LIST_ID = "pixland_global_list";

const upload = multer({
    storage: multer.memoryStorage(),
});

// Allow unauthenticated access for QR scan functionality
router.post("/identify", upload.single("selfie"), async (req, res) => {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                error: "No selfie uploaded",
                message: "Please upload a clear photo of your face to find your photos."
            });
        }

        // Validate file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                error: "Invalid file type",
                message: "Please upload a valid image file (JPG, PNG, etc.)"
            });
        }

        console.log(`[Face Identify] Processing selfie: ${req.file.originalname}, size: ${req.file.size} bytes`);

        // 1. Upload selfie temporarily to Blob
        let selfieUrl;
        try {
            selfieUrl = await uploadToBlob(req.file);
            console.log(`[Face Identify] Selfie uploaded to blob: ${selfieUrl}`);
        } catch (uploadError) {
            console.error("[Face Identify] Blob upload failed:", uploadError);
            return res.status(500).json({
                error: "Upload failed",
                message: "Failed to process your image. Please try again."
            });
        }

        // 2. Detect face in selfie
        let detectedFaces;
        try {
            detectedFaces = await detectFaces(selfieUrl);
            console.log(`[Face Identify] Detected ${detectedFaces.length} face(s)`);
        } catch (faceDetectionError) {
            console.error("[Face Identify] Face detection failed:", faceDetectionError);
            return res.status(500).json({
                error: "Face detection failed",
                message: "Unable to analyze your photo. Please ensure your face is clearly visible and try again."
            });
        }

        if (detectedFaces.length === 0) {
            return res.status(400).json({
                error: "No face detected",
                message: "We couldn't detect a face in your photo. Please upload a clear, front-facing selfie and try again."
            });
        }

        if (detectedFaces.length > 1) {
            console.log(`[Face Identify] Multiple faces detected (${detectedFaces.length}), using first face`);
        }

        const faceId = detectedFaces[0].faceId;

        // 3. Find similar faces in the global FaceList
        let matches;
        try {
            matches = await findSimilarFaces(faceId, FACE_LIST_ID);
            console.log(`[Face Identify] Found ${matches?.length || 0} potential matches`);
        } catch (matchError) {
            console.error("[Face Identify] Face matching failed:", matchError);
            return res.status(500).json({
                error: "Face matching failed",
                message: "Unable to search for your photos. Please try again."
            });
        }

        if (!matches || matches.length === 0) {
            return res.json({
                message: "No photos found",
                images: [],
                matchCount: 0
            });
        }

        // 4. Extract persistedFaceIds and query our Database
        const { eventId, sessionId } = req.body;
        const persistedFaceIds = matches
            .filter(match => match.confidence > 0.6) // Confidence threshold
            .map(match => match.persistedFaceId);

        console.log(`[Face Identify] High-confidence matches: ${persistedFaceIds.length}`);

        if (persistedFaceIds.length === 0) {
            return res.json({
                message: "No high-confidence matches found",
                images: [],
                matchCount: 0
            });
        }

        // Find images that contain any of the matched persistedFaceIds
        const query = {
            "metadata.detectedFaces.persistedFaceId": { $in: persistedFaceIds }
        };
        if (eventId) {
            query.event = eventId;
            console.log(`[Face Identify] Filtering by event: ${eventId}`);
        }

        const matchedImages = await Image.find(query);
        console.log(`[Face Identify] Found ${matchedImages.length} matching images in database`);

        const responseData = {
            message: matchedImages.length > 0
                ? `Found ${matchedImages.length} photo${matchedImages.length === 1 ? '' : 's'} of you!`
                : "No photos found",
            images: matchedImages,
            matchCount: matchedImages.length
        };

        // Emit event if sessionId is present (for QR scan desktop sync)
        if (sessionId) {
            const io = req.app.get("io");
            if (io) {
                io.to(sessionId).emit("scan_complete", responseData);
                console.log(`[Face Identify] Emitted scan_complete to room ${sessionId}`);
            } else {
                console.warn(`[Face Identify] Socket.io not available for session ${sessionId}`);
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error("[Face Identify] Unexpected error:", error);
        res.status(500).json({
            error: "Identification failed",
            message: "An unexpected error occurred. Please try again later."
        });
    }
});

const Person = require("../models/Person");

// 1. Get all Face Groups
router.get("/groups", protect, async (req, res) => {
    try {
        const groups = await Person.find().sort({ faceCount: -1 });
        res.json(groups);
    } catch (error) {
        console.error("Error fetching face groups:", error);
        res.status(500).json({ error: "Failed to fetch face groups" });
    }
});

// 2. Trigger Sync/Grouping Process
router.post("/sync-groups", protect, async (req, res) => {
    try {
        // Fetch all images with detected faces
        const images = await Image.find({ "metadata.detectedFaces.0": { $exists: true } });

        const operations = [];
        const personMap = new Map(); // persistedFaceId -> { count, thumbnail }

        // Aggregate data in memory (for simplicity - huge datasets would need aggregation pipeline)
        for (const img of images) {
            if (img.metadata && img.metadata.detectedFaces) {
                for (const face of img.metadata.detectedFaces) {
                    if (face.persistedFaceId) {
                        const pid = face.persistedFaceId;
                        if (!personMap.has(pid)) {
                            personMap.set(pid, { count: 0, thumbnail: img.url });
                        }
                        const p = personMap.get(pid);
                        p.count += 1;
                        // Determine "best" thumbnail logic here if needed (e.g., biggest face)
                    }
                }
            }
        }

        // Bulk Write to DB
        for (const [pid, data] of personMap.entries()) {
            operations.push({
                updateOne: {
                    filter: { persistedFaceId: pid },
                    update: {
                        $set: {
                            faceCount: data.count,
                            thumbnail: data.thumbnail
                        },
                        $setOnInsert: { name: "Unknown" }
                    },
                    upsert: true
                }
            });
        }

        if (operations.length > 0) {
            await Person.bulkWrite(operations);
        }

        res.json({ message: "Sync complete", totalGroups: personMap.size });

    } catch (error) {
        console.error("Error syncing face groups:", error);
        res.status(500).json({ error: "Sync failed" });
    }
});

module.exports = router;
