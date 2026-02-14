require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(['8.8.8.8', '8.8.4.4']);
const User = require("./src/models/User");
const connectDB = require("./src/config/db");

const verify = async () => {
    await connectDB();
    const users = await User.find({});
    console.log("Total Users in DB:", users.length);
    users.forEach(u => {
        console.log(`Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
    });
    process.exit();
};

verify();
