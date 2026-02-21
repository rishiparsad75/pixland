const mongoose = require("mongoose");

const imageSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        album: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
        },
        url: {
            type: String,
            required: true,
        },
        blobName: {
            type: String,
            required: true
        },
        metadata: {
            detectedFaces: [
                {
                    faceId: String,
                    persistedFaceId: String,
                    descriptor: [Number],
                    faceRectangle: {
                        top: Number,
                        left: Number,
                        width: Number,
                        height: Number
                    }
                }

            ]
        }
    },
    {
        timestamps: true,
    }
);

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
