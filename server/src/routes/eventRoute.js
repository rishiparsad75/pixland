const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { protect, photographer, superAdmin } = require("../middleware/authMiddleware");

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

module.exports = router;
