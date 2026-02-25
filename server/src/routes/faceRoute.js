const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { detectAndExtractDescriptors, compareFaces } = require("../services/faceService");
const Image = require("../models/Image");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
});

/**
 * Identify: Capture selfie -> Extract Embedding -> Match against Event Images
 */
router.post("/identify", upload.single("selfie"), async (req, res) => {
    const startTime = Date.now();
    try {
        if (!req.file) return res.status(400).json({ error: "No selfie uploaded" });
        const { eventId, sessionId } = req.body;

        // 1. Extract embedding from selfie
        console.log("[Identify] Extracting selfie embedding...");
        const selfieResults = await detectAndExtractDescriptors(req.file.buffer);
        if (!selfieResults || selfieResults.length === 0) {
            return res.status(422).json({ error: "NO_FACE_DETECTED", message: "No face found in selfie" });
        }
        const targetEmbedding = selfieResults[0].descriptor;

        // 2. Fetch all images for this event (that have faces)
        const query = {
            "metadata.detectedFaces.0": { $exists: true },
            status: "ready"
        };
        if (eventId) query.event = eventId;

        const eventImages = await Image.find(query).select("url metadata.detectedFaces event");
        console.log(`[Identify] Comparing against ${eventImages.length} images...`);

        // 3. Compare embeddings
        const matches = [];
        const MATCH_THRESHOLD = 0.55;

        for (const img of eventImages) {
            for (const face of img.metadata.detectedFaces) {
                if (!face.descriptor || !Array.isArray(face.descriptor)) continue;

                // Use Python service for comparison
                const similarity = await compareFaces(targetEmbedding, face.descriptor);

                if (similarity >= MATCH_THRESHOLD) {
                    matches.push({
                        url: img.url,
                        eventId: img.event,
                        similarity: parseFloat(similarity.toFixed(4)),
                        faceRectangle: face.faceRectangle
                    });
                    break; // Avoid duplicate matches for same image
                }
            }
        }

        // Sort by similarity
        matches.sort((a, b) => b.similarity - a.similarity);

        const processingTime = Date.now() - startTime;
        const responseData = {
            message: `Found ${matches.length} matches!`,
            images: matches.slice(0, 50),
            matchCount: matches.length,
            processing: false,
            performance: {
                processingTime,
                eventSize: eventImages.length
            }
        };

        if (sessionId) {
            const io = req.app.get("io");
            if (io) io.to(sessionId).emit("scan_complete", responseData);
        }

        res.json(responseData);

    } catch (error) {
        console.error("[Face Identify] Error:", error);
        if (error.code === "NO_FACE_DETECTED") {
            return res.status(422).json({ error: "NO_FACE_DETECTED", message: error.message });
        }
        res.status(500).json({ error: "Identification failed" });
    }
});

module.exports = router;
