const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "photographer", "super-admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["pending", "active", "rejected"],
            default: "pending",
        },
        faceEmbedding: {
            type: [Number],
            select: false,
        },
        assignedPhotographer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        subscription: {
            plan: {
                type: String,
                enum: ['free', 'premium'],
                default: 'free'
            },
            startDate: {
                type: Date,
                default: Date.now
            },
            endDate: Date,
            status: {
                type: String,
                enum: ['active', 'trial', 'expired', 'cancelled'],
                default: 'active'
            },
            trialEndsAt: Date,
            isOnTrial: {
                type: Boolean,
                default: false
            }
        },
        usage: {
            downloads: {
                count: { type: Number, default: 0 },
                lastReset: { type: Date, default: Date.now },
                monthlyLimit: { type: Number, default: 10 } // Free tier limit
            },
            uploads: {
                count: { type: Number, default: 0 },
                lastReset: { type: Date, default: Date.now },
                monthlyLimit: { type: Number, default: 500 } // Free tier limit for photographers
            }
        },
        notifications: {
            emailOnLimitWarning: { type: Boolean, default: true },
            lastWarningEmailSent: Date
        }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
