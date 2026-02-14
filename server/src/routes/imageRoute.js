const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Image = require("../models/Image");

const router = express.Router();

// Get all images for the logged-in user
router.get("/", protect, async (req, res) => {
    try {
        const images = await Image.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: "Error fetching images" });
    }
});

module.exports = router;
