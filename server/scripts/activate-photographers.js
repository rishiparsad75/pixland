require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

const activatePhotographers = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        const result = await User.updateMany(
            { role: "photographer", status: "pending" },
            { $set: { status: "active" } }
        );

        console.log(`Success! Updated ${result.modifiedCount} photographers to 'active'.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

activatePhotographers();
