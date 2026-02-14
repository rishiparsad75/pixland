require("dotenv").config();
const dns = require('dns');
// Force Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require("mongoose");
const User = require("./src/models/User");
const connectDB = require("./src/config/db");

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        const adminUser = await User.create({
            name: "Super Admin",
            email: "admin@pixland.ai",
            password: "password123",
            role: "super-admin",
        });

        const photographer = await User.create({
            name: "Pro Photographer",
            email: "photo@pixland.ai",
            password: "password123",
            role: "photographer",
        });

        const normalUser = await User.create({
            name: "Demo Guest",
            email: "user@pixland.ai",
            password: "password123",
            role: "user"
        });

        console.log("Data Imported!");
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
