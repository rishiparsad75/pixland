const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { protect, photographer, superAdmin } = require("../middleware/authMiddleware");

// Get all active events (Public)
router.get("/list", async (req, res) => {
    try {
        const events = await Event.find({ isActive: true })
            .populate("photographer", "name")
            .sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching events" });
    }
});

// Create a new event (Photographer or Admin)

router.post("/", protect, photographer, async (req, res) => {
    try {
        const { name, location, expiryDate } = req.body;
        const event = new Event({
            name,
            photographer: req.user._id,
            location,
            settings: {
                expiryDate
            }
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: "Error creating event" });
    }
});

// Get all events for the logged-in photographer
router.get("/my-events", protect, photographer, async (req, res) => {
    try {
        const events = await Event.find({ photographer: req.user._id });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching events" });
    }
});

// Get event by QR token (Public access for scanning)
router.get("/scan/:token", async (req, res) => {
    try {
        const event = await Event.findOne({ qrToken: req.params.token }).populate("photographer", "name");
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: "Error fetching event" });
    }
});

// Super Admin: Get all events
router.get("/all", protect, superAdmin, async (req, res) => {
    try {
        const events = await Event.find({}).populate("photographer", "name email");
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching all events" });
    }
});

// Super Admin: Delete event
router.delete("/:id", protect, superAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        await event.deleteOne();
        res.json({ message: "Event removed" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting event" });
    }
});

module.exports = router;
