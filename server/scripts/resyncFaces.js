const mongoose = require("mongoose");
const path = require("path");
const Image = require("../src/models/Image");
const { detectAndExtractDescriptors } = require("../src/services/faceService");
const axios = require("axios");
const dns = require('dns');
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Force Google DNS to resolve MongoDB Atlas SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log("[Setup] DNS servers set to Google Public DNS (8.8.8.8).");
} catch (err) {
    console.warn("[Setup] Warning: Could not set custom DNS servers.", err.message);
}

const resyncAllImages = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");


        const images = await Image.find();
        console.log(`Found ${images.length} images to re-sync.`);

        let processedCount = 0;
        let facesFound = 0;

        for (const img of images) {
            try {
                process.stdout.write(`Processing ${++processedCount}/${images.length}... \r`);

                // Fetch image buffer from URL
                const response = await axios.get(img.url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'binary');

                // Extract faces with new settings (detectAndExtractDescriptors now uses minConfidence: 0.35)
                const results = await detectAndExtractDescriptors(buffer);

                if (results.length > 0) {
                    const detectedFaces = results.map(r => ({
                        descriptor: r.descriptor,
                        faceRectangle: r.faceRectangle
                    }));

                    await Image.updateOne(
                        { _id: img._id },
                        { $set: { "metadata.detectedFaces": detectedFaces } }
                    );
                    facesFound += results.length;
                }
            } catch (imgError) {
                console.error(`\nFailed to process image ${img._id}:`, imgError.message);
            }
        }

        console.log(`\nRe-sync complete!`);
        console.log(`Total Images Processed: ${processedCount}`);
        console.log(`Total Faces Detected: ${facesFound}`);
        process.exit(0);
    } catch (error) {
        console.error("Re-sync failed:", error);
        process.exit(1);
    }
};

resyncAllImages();
