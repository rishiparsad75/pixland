/**
 * Re-index all images in MongoDB using new Python ArcFace service.
 * This replaces old face-api.js descriptors with ArcFace (512D) embeddings.
 * 
 * Usage: node reindex_faces.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const axios = require("axios");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: path.join(__dirname, ".env") });

const PYTHON_FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "https://pixland-face-service-bffshxd7ccg8d3dg.centralindia-01.azurewebsites.net";

const ImageSchema = new mongoose.Schema({}, { strict: false });
const Image = mongoose.model("Image", ImageSchema);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function extractFromUrl(imageUrl, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            // Download image from Azure Blob
            const imgRes = await axios.get(imageUrl, {
                responseType: "arraybuffer",
                timeout: 30000 // 30s for download
            });
            const base64Image = Buffer.from(imgRes.data).toString("base64");

            // Send to Python ArcFace service
            const faceRes = await axios.post(
                `${PYTHON_FACE_SERVICE_URL}/extract`,
                { image: base64Image },
                { timeout: 120000, headers: { "Content-Type": "application/json" } }
            );

            return {
                embedding: faceRes.data.embedding,
                face_area: faceRes.data.face_area,
                face_count: faceRes.data.face_count
            };
        } catch (err) {
            const isNoFace = err.response?.data?.error === "NO_FACE_DETECTED";
            if (isNoFace) return null;

            console.log(`  [Retry ${i + 1}/${retries}] Failed: ${err.message}`);
            if (i === retries - 1) throw err;
            await sleep(5000 * (i + 1)); // Exponential backoff
        }
    }
}

async function run() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!");

    // Check Python service connectivity (with 5 min timeout for heavy cold start)
    try {
        console.log(`Pinging Python service at ${PYTHON_FACE_SERVICE_URL}... (Waiting up to 5 mins)`);
        const ping = await axios.get(`${PYTHON_FACE_SERVICE_URL}/`, { timeout: 300000 });
        console.log(`Python service connectivity: ${ping.data.message}`);
    } catch (err) {
        console.error(`Python face service is NOT reachable at ${PYTHON_FACE_SERVICE_URL}. Error: ${err.message}`);
        process.exit(1);
    }

    const images = await Image.find({ status: "ready" });
    console.log(`Found ${images.length} images total. Filtering for unindexed ones...`);

    // Only process images that don't have an ArcFace descriptor yet
    const toProcess = images.filter(img => {
        const hasArcFace = img.metadata?.detectedFaces?.[0]?.descriptor?.length === 512;
        return !hasArcFace;
    });

    console.log(`Found ${toProcess.length} images to re-index.`);

    let success = 0, skipped = 0, failed = 0;

    for (let i = 0; i < toProcess.length; i++) {
        const img = toProcess[i];
        const label = `[${i + 1}/${toProcess.length}]`;

        try {
            console.log(`${label} Processing: ${img.url.substring(0, 60)}...`);
            const result = await extractFromUrl(img.url);

            if (!result) {
                console.log(`${label}  → No face detected, marking as no-face`);
                img.metadata = { detectedFaces: [] };
                await img.save();
                skipped++;
                continue;
            }

            img.metadata = {
                detectedFaces: [{
                    descriptor: result.embedding,
                    faceRectangle: result.face_area ? {
                        top: result.face_area.y,
                        left: result.face_area.x,
                        width: result.face_area.w,
                        height: result.face_area.h
                    } : {},
                    indexed: true
                }]
            };
            img.status = "ready";
            img.processedAt = new Date();
            await img.save();

            console.log(`${label}  ✓ ArcFace embedding saved (${result.embedding.length}D)`);
            success++;
        } catch (err) {
            console.error(`${label}  ✗ Error: ${err.message}`);
            failed++;
        }

        // 5s delay to cool down B1 plan
        await sleep(5000);
    }

    console.log("\n=== Re-indexing Complete ===");
    console.log(`✓ Success: ${success}`);
    console.log(`⊘ Skipped (no face): ${skipped}`);
    console.log(`✗ Failed: ${failed}`);
    process.exit(0);
}

run().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
