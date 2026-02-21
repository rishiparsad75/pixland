const express = require("express");
const multer = require("multer");


const { protect } = require("../middleware/authMiddleware");
const { detectAndExtractDescriptors, compareFaces } = require("../services/faceService");

const Image = require("../models/Image");

const router = express.Router();



const upload = multer({
    storage: multer.memoryStorage(),
});


// New Endpoint: Match based on descriptor from client


router.post("/match", async (req, res) => {
    try {
        const { descriptor, eventId, sessionId } = req.body;

        if (!descriptor || !Array.isArray(descriptor)) {
            return res.status(400).json({ error: "Invalid descriptor provided" });
        }

        console.log(`[Face Match] Searching for matches. Event: ${eventId || 'All'}`);

        // 1. Fetch images (optionally filter by event)
        const query = { "metadata.detectedFaces.0": { $exists: true } };
        if (eventId) query.event = eventId;

        const images = await Image.find(query);
        const matches = [];

        // 2. Compare descriptors using Euclidean Distance (lower = more similar)
        for (const img of images) {
            for (const face of img.metadata.detectedFaces) {
                if (face.descriptor) {
                    const distance = compareFaces(descriptor, face.descriptor);
                    // Threshold: < 0.5 = strong match, < 0.6 = good match
                    if (distance < 0.5) {
                        matches.push({
                            ...img.toObject(),
                            similarity: parseFloat((1 - distance).toFixed(3)) // Convert to 0-1 score for UI
                        });
                        break; // Move to next image once one face matches
                    }
                }
            }
        }

        // 3. Sort by similarity
        matches.sort((a, b) => b.similarity - a.similarity);

        const responseData = {
            message: matches.length > 0 ? `Found ${matches.length} matches!` : "No matches found",
            images: matches,
            matchCount: matches.length
        };

        // 4. Socket Sync if needed
        if (sessionId) {
            const io = req.app.get("io");
            if (io) io.to(sessionId).emit("scan_complete", responseData);
        }

        res.json(responseData);
    } catch (error) {
        console.error("[Face Match] Error:", error);
        res.status(500).json({ error: "Match failed" });
    }
});

// Legacy Identity Route (Uses server-side detection)
router.post("/identify", upload.single("selfie"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No selfie uploaded" });

        const { eventId, sessionId } = req.body;

        // 1. Detect & Extract from selfie
        const results = await detectAndExtractDescriptors(req.file.buffer);
        if (results.length === 0) {
            return res.status(400).json({ message: "No face detected in selfie" });
        }

        const userDescriptor = results[0].descriptor;

        // 2. Match against DB (same logic as /match)
        const query = { "metadata.detectedFaces.0": { $exists: true } };
        if (eventId) query.event = eventId;

        const images = await Image.find(query);
        const matches = [];

        for (const img of images) {
            for (const face of img.metadata.detectedFaces) {
                if (face.descriptor) {
                    const distance = compareFaces(userDescriptor, face.descriptor);
                    if (distance < 0.5) {
                        matches.push({ ...img.toObject(), similarity: parseFloat((1 - distance).toFixed(3)) });
                        break;
                    }
                }
            }
        }

        matches.sort((a, b) => b.similarity - a.similarity);

        const responseData = {
            message: matches.length > 0 ? `Found ${matches.length} photos!` : "No photos found",
            images: matches,
            matchCount: matches.length
        };

        if (sessionId) {
            const io = req.app.get("io");
            if (io) io.to(sessionId).emit("scan_complete", responseData);
        }

        res.json(responseData);
    } catch (error) {
        console.error("[Face Identify] Error:", error);
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

        // Aggregate data in memory
        for (const img of images) {
            if (img.metadata && img.metadata.detectedFaces) {
                for (const face of img.metadata.detectedFaces) {
                    // Grouping logic for face-api might need clustering
                    // For now, we keep the schema compatible if possible
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
