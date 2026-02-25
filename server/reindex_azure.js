/**
 * Re-index all images in MongoDB using managed Azure Face API.
 * This script downloads images from Azure Blob and adds them to a persistent LargeFaceList.
 * 
 * Usage: node reindex_azure.js
 */

const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

// Force Google DNS to fix SRV resolution issues on some networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const axios = require("axios");
const { addFaceToList, ensureFaceListExists } = require("./src/services/faceService");

const ImageSchema = new mongoose.Schema({}, { strict: false });
const Image = mongoose.model("Image", ImageSchema);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
    console.log("Connecting to MongoDB (using IPv4 force)...");
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 10000,
        });
        console.log("Connected Successfully!");
    } catch (connErr) {
        console.error("\n!!! MongoDB Connection Failed !!!");
        console.error("Error Code:", connErr.code);
        if (connErr.code === 'ECONNREFUSED' && connErr.syscall === 'querySrv') {
            console.error("TIP: Your DNS/Internet is blocking MongoDB SRV records.");
            console.error("Fix 1: Try connecting via a Mobile Hotspot.");
            console.error("Fix 2: Set your Windows DNS to Google (8.8.8.8).");
        }
        throw connErr;
    }

    console.log("Initializing Azure FaceList...");
    await ensureFaceListExists();

    const images = await Image.find({ status: "ready" });
    console.log(`Found ${images.length} images to re-index.`);

    let success = 0, skipped = 0, failed = 0;

    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const label = `[${i + 1}/${images.length}]`;

        try {
            console.log(`${label} Processing: ${img.url.substring(0, 60)}...`);

            // Download image
            const imgRes = await axios.get(img.url, { responseType: "arraybuffer", timeout: 15000 });

            // Add to Azure FaceList
            const persistedFaceId = await addFaceToList(imgRes.data, img._id.toString());

            if (!persistedFaceId) {
                console.log(`${label}  → No face detected or Azure Error`);
                img.metadata = { detectedFaces: [] };
                await img.save();
                skipped++;
            } else {
                img.metadata = {
                    detectedFaces: [{
                        descriptor: persistedFaceId,
                        indexed: true,
                        azurePersistedFaceId: persistedFaceId
                    }]
                };
                await img.save();
                console.log(`${label}  ✓ Azure PersistedFaceId saved: ${persistedFaceId}`);
                success++;
            }
        } catch (err) {
            console.error(`${label}  ✗ Error: ${err.message}`);
            failed++;
        }

        // Throttle heavily for Azure F0 Tier (20 requests per minute)
        // 1 request every 4.5 seconds to be safe
        await sleep(4500);
    }

    console.log("\nRe-indexing complete. Training the FaceList...");
    // Import SDK for training
    const { FaceClient } = require("@azure/cognitiveservices-face");
    const { ApiKeyCredentials } = require("@azure/ms-rest-js");
    const faceClient = new FaceClient(
        new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": process.env.AZURE_FACE_KEY } }),
        process.env.AZURE_FACE_ENDPOINT
    );
    await faceClient.largeFaceList.train("pixland-global-list");

    console.log("\n=== Re-indexing Summary ===");
    console.log(`✓ Success: ${success}`);
    console.log(`⊘ Skipped/No Face: ${skipped}`);
    console.log(`✗ Failed: ${failed}`);
    process.exit(0);
}

run().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
