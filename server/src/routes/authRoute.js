const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, superAdmin } = require("../middleware/authMiddleware");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            const isMatch = await user.matchPassword(password);
            console.log(`Login attempt for ${email}: User found, Password match: ${isMatch}`);
            if (isMatch) {
                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role, // Essential for frontend RBAC
                    token: generateToken(user._id),
                });
            }
        } else {
            console.log(`Login attempt for ${email}: User NOT found`);
        }
        res.status(401).json({ message: "Invalid email or password" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Super Admin: Get all photographers
router.get("/photographers", protect, superAdmin, async (req, res) => {
    try {
        const photographers = await User.find({ role: "photographer" }).select("-password");
        res.json(photographers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching photographers" });
    }
});

// Super Admin: Create a photographer
router.post("/photographers", protect, superAdmin, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const photographer = await User.create({
            name,
            email,
            password,
            role: "photographer"
        });
        res.status(201).json({ _id: photographer._id, name: photographer.name, email: photographer.email });
    } catch (error) {
        res.status(500).json({ message: "Error creating photographer" });
    }
});

module.exports = router;
