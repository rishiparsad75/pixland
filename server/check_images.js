const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log("[Setup] DNS servers set to Google Public DNS.");
} catch (err) {
    console.warn("[Setup] Warning: Could not set custom DNS servers.", err.message);
}

dotenv.config({ path: path.join(__dirname, ".env") });

const ImageSchema = new mongoose.Schema({}, { strict: false });
const Image = mongoose.model("Image", ImageSchema);

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const images = await Image.find({}).limit(10);
        console.log(`Found ${images.length} images`);

        images.forEach((img, i) => {
            console.log(`\nImage ${i + 1}:`);
            console.log(`URL: ${img.url}`);
            console.log(`Status: ${img.status}`);
            console.log(`Event: ${img.event}`);
            const faces = img.metadata?.detectedFaces || [];
            console.log(`Faces count: ${faces.length}`);
            if (faces.length > 0) {
                const desc = faces[0].descriptor;
                console.log(`First Face Descriptor Length: ${desc?.length}`);
                if (desc) {
                    let sumSq = 0;
                    for (let x of desc) sumSq += x * x;
                    const magnitude = Math.sqrt(sumSq);
                    console.log(`First Face Descriptor Magnitude: ${magnitude}`);
                }
                console.log(`First Face Indexed: ${faces[0].indexed}`);
            }
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
