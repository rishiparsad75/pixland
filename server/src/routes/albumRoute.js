const express = require("express");
const { protect, superAdmin } = require("../middleware/authMiddleware");
const Album = require("../models/Album");
const User = require("../models/User");

const router = express.Router();

// @desc    Create a new album
// @route   POST /api/albums
// @access  Private/Admin
router.post("/", protect, superAdmin, async (req, res) => {
    const { name, description, assignedUsers } = req.body;

    try {
        const album = await Album.create({
            name,
            description,
            assignedUsers,
            createdBy: req.user._id,
        });
        res.status(201).json(album);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get all albums
// @route   GET /api/albums
// @access  Private/Admin
router.get("/", protect, superAdmin, async (req, res) => {
    try {
        const albums = await Album.find({}).populate("assignedUsers", "name email");
        res.json(albums);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get assigned albums for user
// @route   GET /api/albums/myalbums
// @access  Private
router.get("/myalbums", protect, async (req, res) => {
    try {
        const albums = await Album.find({ assignedUsers: req.user._id });
        res.json(albums);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
