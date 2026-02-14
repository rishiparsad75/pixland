const mongoose = require("mongoose");
const crypto = require("crypto");

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    photographer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    location: String,
    qrToken: {
        type: String,
        unique: true,
        default: () => crypto.randomBytes(16).toString("hex")
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        faceThreshold: {
            type: Number,
            default: 0.6
        },
        expiryDate: Date
    }
}, { timestamps: true });

// Index for fast QR lookups
eventSchema.index({ qrToken: 1 });

module.exports = mongoose.model("Event", eventSchema);
