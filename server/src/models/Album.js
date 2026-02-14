const mongoose = require("mongoose");

const albumSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        coverImage: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

const Album = mongoose.model("Album", albumSchema);

module.exports = Album;
