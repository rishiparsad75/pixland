const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Image = require("../models/Image");

const router = express.Router();

// Get images based on user role
router.get("/", protect, async (req, res) => {
    try {
        let images;

        // Super admin and photographer see ALL images
        if (req.user.role === 'super-admin' || req.user.role === 'photographer') {
            images = await Image.find({})
                .populate("user", "name email")
                .populate("event", "name")
                .sort({ createdAt: -1 });
        } else {
            // Regular users only see their own images
            images = await Image.find({ user: req.user._id }).sort({ createdAt: -1 });
        }

        res.json(images);
    } catch (error) {
        res.status(500).json({ message: "Error fetching images" });
    }
});

const { superAdmin } = require("../middleware/authMiddleware");
const { deleteFromBlob } = require("../services/blobService");

// Super Admin: Get all images
router.get("/all", protect, superAdmin, async (req, res) => {
    try {
        const images = await Image.find({})
            .populate("user", "name email")
            .populate("event", "name")
            .sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: "Error fetching all images" });
    }
});

// Super Admin: Delete image
router.delete("/:id", protect, superAdmin, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) return res.status(404).json({ message: "Image not found" });

        // Delete from Azure Blob Storage
        if (image.blobName) {
            await deleteFromBlob(image.blobName);
        }

        await image.deleteOne();
        res.json({ message: "Image deleted" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ message: "Error deleting image" });
    }
});

module.exports = router;
