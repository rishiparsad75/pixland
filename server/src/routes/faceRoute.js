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

        // 2. Perform ultra-fast in-memory matching
        const { findMatchesInMemory } = require("../services/faceService");
        const matches = findMatchesInMemory(targetEmbedding, 0.5); // 0.5 distance threshold

        console.log(`[Identify] In-memory found ${matches.length} matches.`);

        const serviceStatus = (require("../services/faceService").getServiceStatus());
        const responseData = {
            message: `Found ${matches.length} matches!`,
            images: matches.slice(0, 50),
            matchCount: matches.length,
            processing: false,
            performance: {
                processingTime,
                cacheSize: serviceStatus.descriptorCount,
                activeScans: serviceStatus.activeScans,
                queueLength: serviceStatus.queueLength
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
