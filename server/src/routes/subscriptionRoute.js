const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");
const { hasPremiumAccess, isOnActiveTrial } = require("../middleware/usageLimits");
const SubscriptionRequest = require("../models/SubscriptionRequest");
const multer = require("multer");
const { uploadToBlob } = require("../services/blobService");

const upload = multer({ storage: multer.memoryStorage() });

// Get subscription status and usage
router.get("/status", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        const isPremium = hasPremiumAccess(user);
        const onTrial = isOnActiveTrial(user);

        // Calculate limits
        const downloadLimit = isPremium ? 'unlimited' : 10;
        const uploadLimit = user.role === 'photographer' ? (isPremium ? 'unlimited' : 500) : 'N/A';

        res.json({
            plan: user.subscription.plan,
            status: user.subscription.status,
            isPremium,
            onTrial,
            trialEndsAt: user.subscription.trialEndsAt,
            usage: {
                downloads: {
                    count: user.usage.downloads.count,
                    limit: downloadLimit,
                    remaining: isPremium ? 'unlimited' : Math.max(0, 10 - user.usage.downloads.count)
                },
                uploads: user.role === 'photographer' ? {
                    count: user.usage.uploads.count,
                    limit: uploadLimit,
                    remaining: isPremium ? 'unlimited' : Math.max(0, 500 - user.usage.uploads.count)
                } : null
            },
            pricing: {
                user: user.role === 'user' ? '₹499/month' : null,
                photographer: user.role === 'photographer' ? '₹999/month' : null
            }
        });
    } catch (error) {
        console.error("Error fetching subscription status:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Start free trial
router.post("/trial/start", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Check if already on trial or premium
        if (user.subscription.isOnTrial || user.subscription.plan === 'premium') {
            return res.status(400).json({
                message: "You have already used your free trial or are on a premium plan."
            });
        }

        // Determine trial duration based on role
        const trialDays = user.role === 'photographer' ? 9 : 7;
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

        user.subscription.isOnTrial = true;
        user.subscription.trialEndsAt = trialEndsAt;
        user.subscription.status = 'trial';

        await user.save();

        res.json({
            message: `Free trial started! You have ${trialDays} days of unlimited access.`,
            trialEndsAt,
            daysRemaining: trialDays
        });
    } catch (error) {
        console.error("Error starting trial:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Upgrade to premium (placeholder - payment integration later)
router.post("/upgrade", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // TODO: Integrate payment gateway (Razorpay/Stripe)
        // For now, just upgrade directly (for testing)

        user.subscription.plan = 'premium';
        user.subscription.status = 'active';
        user.subscription.startDate = new Date();

        // Set expiry to 30 days from now
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        user.subscription.endDate = endDate;

        // Clear trial status
        user.subscription.isOnTrial = false;
        user.subscription.trialEndsAt = null;

        await user.save();

        const price = user.role === 'photographer' ? '₹999' : '₹499';

        res.json({
            message: `Successfully upgraded to Premium! (${price}/month)`,
            subscription: {
                plan: user.subscription.plan,
                status: user.subscription.status,
                endDate: user.subscription.endDate
            }
        });
    } catch (error) {
        console.error("Error upgrading subscription:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Submit manual payment request
router.post("/request", protect, upload.single("screenshot"), async (req, res) => {
    try {
        const { plan, utr, amount } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Payment screenshot is required" });
        }

        // Check if UTR already exists
        const existingRequest = await SubscriptionRequest.findOne({ utr });
        if (existingRequest) {
            return res.status(400).json({ message: "This UTR has already been submitted." });
        }

        // Upload screenshot to Blob
        const screenshotUrl = await uploadToBlob(req.file);

        const request = await SubscriptionRequest.create({
            user: req.user.id,
            plan: plan || "premium",
            utr,
            paymentScreenshot: screenshotUrl,
            amount: amount || (req.user.role === 'photographer' ? 999 : 499),
            status: "pending"
        });

        res.status(201).json({
            message: "Subscription request submitted successfully. Admin will verify it shortly.",
            request
        });
    } catch (error) {
        console.error("Error submitting subscription request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all requests (Admin only)
router.get("/admin/requests", protect, admin, async (req, res) => {
    try {
        const requests = await SubscriptionRequest.find()
            .populate("user", "name email role")
            .sort("-createdAt");
        res.json(requests);
    } catch (error) {
        console.error("Error fetching subscription requests:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Verify/Approve request (Admin only)
router.post("/admin/verify", protect, admin, async (req, res) => {
    try {
        const { requestId, status, adminNotes } = req.body;

        if (!requestId || !["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const request = await SubscriptionRequest.findById(requestId).populate("user");
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Request has already been processed" });
        }

        request.status = status;
        request.adminNotes = adminNotes;
        await request.save();

        if (status === "approved") {
            const user = request.user;
            user.subscription.plan = request.plan;
            user.subscription.status = "active";
            user.subscription.startDate = new Date();

            // Set expiry to 30 days from now
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            user.subscription.endDate = endDate;

            user.subscription.isOnTrial = false;
            user.subscription.trialEndsAt = null;

            await user.save();
        }

        res.json({
            message: `Subscription request ${status} successfully`,
            request
        });
    } catch (error) {
        console.error("Error verifying subscription request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Cancel subscription
router.post("/cancel", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.subscription.plan === 'free') {
            return res.status(400).json({ message: "You are already on the free plan." });
        }

        user.subscription.plan = 'free';
        user.subscription.status = 'cancelled';
        user.subscription.endDate = null;

        await user.save();

        res.json({
            message: "Subscription cancelled. You are now on the free plan.",
            subscription: user.subscription
        });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
