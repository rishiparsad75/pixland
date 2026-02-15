const User = require("../models/User");

// Constants
const FREE_DOWNLOAD_LIMIT = 10;
const FREE_UPLOAD_LIMIT = 500;
const GRACE_PERIOD = 2; // Extra downloads/uploads allowed

// Helper: Reset monthly usage if needed
const resetMonthlyUsageIfNeeded = async (user) => {
    const now = new Date();

    // Reset downloads
    const lastDownloadReset = new Date(user.usage.downloads.lastReset);
    if (now.getMonth() !== lastDownloadReset.getMonth() || now.getFullYear() !== lastDownloadReset.getFullYear()) {
        user.usage.downloads.count = 0;
        user.usage.downloads.lastReset = now;
    }

    // Reset uploads
    const lastUploadReset = new Date(user.usage.uploads.lastReset);
    if (now.getMonth() !== lastUploadReset.getMonth() || now.getFullYear() !== lastUploadReset.getFullYear()) {
        user.usage.uploads.count = 0;
        user.usage.uploads.lastReset = now;
    }

    await user.save();
};

// Helper: Check if user is on trial
const isOnActiveTrial = (user) => {
    if (!user.subscription.isOnTrial || !user.subscription.trialEndsAt) {
        return false;
    }
    return new Date() < new Date(user.subscription.trialEndsAt);
};

// Helper: Check if user has premium access (either paid or trial)
const hasPremiumAccess = (user) => {
    return user.subscription.plan === 'premium' || isOnActiveTrial(user);
};

// Middleware: Check download limit
const checkDownloadLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Reset monthly counter if needed
        await resetMonthlyUsageIfNeeded(user);

        // Premium users (including trial) have unlimited downloads
        if (hasPremiumAccess(user)) {
            req.user = user; // Update req.user with latest data
            return next();
        }

        // Free tier: Check limit with grace period
        const effectiveLimit = FREE_DOWNLOAD_LIMIT + GRACE_PERIOD;

        if (user.usage.downloads.count >= effectiveLimit) {
            // Hard block
            return res.status(403).json({
                error: 'Download limit exceeded',
                message: `You have reached your free tier limit of ${FREE_DOWNLOAD_LIMIT} downloads (plus ${GRACE_PERIOD} grace downloads). Upgrade to Premium for unlimited downloads!`,
                upgradeRequired: true,
                currentUsage: user.usage.downloads.count,
                limit: FREE_DOWNLOAD_LIMIT
            });
        }

        // Warning if approaching limit
        if (user.usage.downloads.count >= FREE_DOWNLOAD_LIMIT - 2) {
            res.locals.limitWarning = {
                message: `You have ${effectiveLimit - user.usage.downloads.count} downloads remaining this month.`,
                upgradeRecommended: true
            };
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in checkDownloadLimit:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Middleware: Check upload limit (for photographers)
const checkUploadLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Only apply to photographers
        if (user.role !== 'photographer') {
            req.user = user;
            return next();
        }

        // Reset monthly counter if needed
        await resetMonthlyUsageIfNeeded(user);

        // Premium photographers (including trial) have unlimited uploads
        if (hasPremiumAccess(user)) {
            req.user = user;
            return next();
        }

        // Free tier: Check limit with grace period
        const effectiveLimit = FREE_UPLOAD_LIMIT + GRACE_PERIOD;

        if (user.usage.uploads.count >= effectiveLimit) {
            // Hard block
            return res.status(403).json({
                error: 'Upload limit exceeded',
                message: `You have reached your free tier limit of ${FREE_UPLOAD_LIMIT} uploads (plus ${GRACE_PERIOD} grace uploads). Upgrade to Premium for unlimited uploads!`,
                upgradeRequired: true,
                currentUsage: user.usage.uploads.count,
                limit: FREE_UPLOAD_LIMIT
            });
        }

        // Warning if approaching limit
        if (user.usage.uploads.count >= FREE_UPLOAD_LIMIT - 10) {
            res.locals.limitWarning = {
                message: `You have ${effectiveLimit - user.usage.uploads.count} uploads remaining this month.`,
                upgradeRecommended: true
            };
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in checkUploadLimit:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Middleware: Track download
const trackDownload = async (req, res, next) => {
    try {
        if (req.user && !hasPremiumAccess(req.user)) {
            req.user.usage.downloads.count += 1;
            await req.user.save();
            console.log(`[Usage] User ${req.user.email} downloaded. Count: ${req.user.usage.downloads.count}/${FREE_DOWNLOAD_LIMIT}`);
        }
        next();
    } catch (error) {
        console.error("Error tracking download:", error);
        next(); // Don't block the request if tracking fails
    }
};

// Middleware: Track upload
const trackUpload = async (req, res, next) => {
    try {
        if (req.user && req.user.role === 'photographer' && !hasPremiumAccess(req.user)) {
            req.user.usage.uploads.count += 1;
            await req.user.save();
            console.log(`[Usage] Photographer ${req.user.email} uploaded. Count: ${req.user.usage.uploads.count}/${FREE_UPLOAD_LIMIT}`);
        }
        next();
    } catch (error) {
        console.error("Error tracking upload:", error);
        next(); // Don't block the request if tracking fails
    }
};

module.exports = {
    checkDownloadLimit,
    checkUploadLimit,
    trackDownload,
    trackUpload,
    hasPremiumAccess,
    isOnActiveTrial
};
