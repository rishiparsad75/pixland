const express = require("express");
const router = express.Router();
const { protect, superAdmin, photographer } = require("../middleware/authMiddleware");
const { getSystemStats, getPhotographerStats, generateSystemReport } = require("../services/analyticsService");

// Get system-wide stats (Super Admin only)
router.get("/system", protect, superAdmin, async (req, res) => {
    try {
        const stats = await getSystemStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching system stats" });
    }
});

// Download system report (Super Admin only)
router.get("/report", protect, superAdmin, async (req, res) => {
    try {
        const csv = await generateSystemReport();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=pixland-system-report.csv');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: "Error generating report" });
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
