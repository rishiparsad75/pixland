const mongoose = require("mongoose");

const calibrationSchema = mongoose.Schema(
    {
        eventId: String,
        topSimilarity: Number,
        matchCount: Number,
        eventSize: Number, // Total images queried
        matchOutcome: String, // 'high', 'medium', 'low', 'none'
        processingTime: Number, // in ms
        isProcessing: Boolean,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
);

const Calibration = mongoose.model("Calibration", calibrationSchema);

module.exports = Calibration;
