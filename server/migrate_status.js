const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log("[Setup] DNS servers set to Google Public DNS.");
} catch (err) {
    console.warn("[Setup] Warning: Could not set custom DNS servers.", err.message);
}

const ImageSchema = new mongoose.Schema({}, { strict: false });
const Image = mongoose.model("Image", ImageSchema);

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const result = await Image.updateMany(
            { status: { $exists: false }, "metadata.detectedFaces.0": { $exists: true } },
            { $set: { status: "ready", processedAt: new Date() } }
        );

        console.log(`Updated ${result.modifiedCount} images to 'ready' status.`);

        const faceResult = await Image.updateMany(
            { "metadata.detectedFaces.indexed": { $exists: false } },
            { $set: { "metadata.detectedFaces.$[].indexed": true } }
        );
        console.log(`Updated descriptors to 'indexed: true'.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
