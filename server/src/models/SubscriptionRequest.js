const mongoose = require("mongoose");

const subscriptionRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    plan: {
        type: String,
        enum: ["premium"],
        default: "premium"
    },
    utr: {
        type: String,
        required: true,
        unique: true
    },
    paymentScreenshot: {
        type: String, // Azure Blob URL
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    amount: {
        type: Number,
        required: true
    },
    adminNotes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("SubscriptionRequest", subscriptionRequestSchema);
