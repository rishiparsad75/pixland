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

router.post("/identify", protect, upload.single("selfie"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No selfie uploaded" });
        }

        // 1. Upload selfie temporarily to Blob (or just process in memory)
        // Azure Face API identify often works better with URLs for consistency
        const selfieUrl = await uploadToBlob(req.file);

        // 2. Detect face in selfie
        const detectedFaces = await detectFaces(selfieUrl);
        if (detectedFaces.length === 0) {
            return res.status(400).json({ error: "No face detected in selfie" });
        }

        const faceId = detectedFaces[0].faceId;

        // 3. Find similar faces in the global FaceList
        const matches = await findSimilarFaces(faceId, FACE_LIST_ID);

        if (!matches || matches.length === 0) {
            return res.json({
                message: "No matches found.",
                images: []
            });
        }

        // 4. Extract persistedFaceIds and query our Database
        const { eventId } = req.body;
        const persistedFaceIds = matches
            .filter(match => match.confidence > 0.6) // Confirmed threshold
            .map(match => match.persistedFaceId);

        if (persistedFaceIds.length === 0) {
            return res.json({
                message: "No high-confidence matches found.",
                images: []
            });
        }

        // Find images that contain any of the matched persistedFaceIds
        // Query filter: must match face AND event (if eventId provided)
        const query = {
            "metadata.detectedFaces.persistedFaceId": { $in: persistedFaceIds }
        };
        if (eventId) {
            query.event = eventId;
        }

        const matchedImages = await Image.find(query);

        res.json({
            message: `Found ${matchedImages.length} photos of you!`,
            images: matchedImages,
            matchCount: matchedImages.length
        });

    } catch (error) {
        console.error("Identification failed:", error);
        res.status(500).json({ error: "Identification failed" });
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
