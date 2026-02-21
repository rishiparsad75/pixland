const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Image = require("../models/Image");

const router = express.Router();

// Get images based on user role
router.get("/", protect, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'super-admin') {
            // Admin sees everything
            query = {};
        } else if (req.user.role === 'photographer') {
            // Photographer only sees photos from THEIR events
            const Event = require("../models/Event");
            const myEvents = await Event.find({ photographer: req.user._id }).select("_id");
            const eventIds = myEvents.map(e => e._id);
            query = { event: { $in: eventIds } };
        } else {
            // Regular users only see their own images (after face match usually)
            query = { user: req.user._id };
        }

        const images = await Image.find(query)
            .populate("user", "name email")
            .populate("event", "name location createdAt")
            .sort({ createdAt: -1 });

        res.json(images);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ message: "Error fetching images" });
    }
});

// Get images for a specific event (Scoped)
router.get("/event/:eventId", protect, async (req, res) => {
    try {
        const { eventId } = req.params;
        const Event = require("../models/Event");
        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: "Event not found" });

        // Access Control
        if (req.user.role !== 'super-admin' && event.photographer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to view this event's photos" });
        }

        const images = await Image.find({ event: eventId })
            .populate("user", "name email")
            .populate("event", "name location createdAt")
            .sort({ createdAt: -1 });

        res.json({ event, images });
    } catch (error) {
        console.error("Error fetching event images:", error);
        res.status(500).json({ message: "Error fetching event photos" });
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
