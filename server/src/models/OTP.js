const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
    {
        mobile: {
            type: String,
            required: true,
            index: true,
        },
        pinId: {
            type: String,
            required: true,
        },

        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, // 5 minutes (300 seconds)
        },
    },
    {
        timestamps: true,
    }
);

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
