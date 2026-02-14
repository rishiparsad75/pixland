const express = require("express");
const router = express.Router();
const { protect, superAdmin, photographer } = require("../middleware/authMiddleware");
const { getSystemStats, getPhotographerStats } = require("../services/analyticsService");

// Get system-wide stats (Super Admin only)
router.get("/system", protect, superAdmin, async (req, res) => {
    try {
        const stats = await getSystemStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching system stats" });
    }
});

// Get photographer-specific stats
router.get("/photographer", protect, photographer, async (req, res) => {
    try {
        const stats = await getPhotographerStats(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching photographer stats" });
    }
});

module.exports = router;
