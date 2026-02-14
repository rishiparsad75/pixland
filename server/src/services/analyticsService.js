const Image = require("../models/Image");
const Event = require("../models/Event");
const User = require("../models/User");

const getSystemStats = async () => {
    const [totalUsers, totalEvents, totalPhotos, photographers] = await Promise.all([
        User.countDocuments({ role: "user" }),
        Event.countDocuments(),
        Image.countDocuments(),
        User.countDocuments({ role: "photographer" })
    ]);

    return {
        totalUsers,
        totalEvents,
        totalPhotos,
        totalPhotographers: photographers
    };
};

const getPhotographerStats = async (photographerId) => {
    const events = await Event.find({ photographer: photographerId });
    const eventIds = events.map(e => e._id);

    const photoCount = await Image.countDocuments({ event: { $in: eventIds } });

    // Group photos by event for the chart
    const photosPerEvent = await Image.aggregate([
        { $match: { event: { $in: eventIds } } },
        { $group: { _id: "$event", count: { $sum: 1 } } },
        {
            $lookup: {
                from: "events",
                localField: "_id",
                foreignField: "_id",
                as: "eventDetails"
            }
        },
        { $unwind: "$eventDetails" },
        {
            $project: {
                name: "$eventDetails.name",
                count: 1
            }
        }
    ]);

    return {
        eventCount: events.length,
        photoCount,
        photosPerEvent
    };
};

module.exports = {
    getSystemStats,
    getPhotographerStats
};
