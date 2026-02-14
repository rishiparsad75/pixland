const mongoose = require("mongoose");

const personSchema = mongoose.Schema(
    {
        name: {
            type: String,
            default: "Unknown",
        },
        persistedFaceId: {
            type: String,
            required: true,
            unique: true,
        },
        faceCount: {
            type: Number,
            default: 1,
        },
        thumbnail: {
            type: String,
        },
        // Optional: Link to specific events if we want to filter groups by event
        events: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
        }]
    },
    {
        timestamps: true,
    }
);

const Person = mongoose.model("Person", personSchema);

module.exports = Person;
