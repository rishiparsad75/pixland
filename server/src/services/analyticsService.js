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

    // Calculate Monthly Growth (Last 6 months)
    const monthlyGrowth = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = months[d.getMonth()];

        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const count = await User.countDocuments({
            createdAt: { $gte: start, $lte: end }
        });

        monthlyGrowth.push({ month: monthName, count });
    }

    return {
        totalUsers,
        totalEvents,
        totalPhotos,
        totalPhotographers: photographers,
        monthlyGrowth
    };
};

const generateSystemReport = async () => {
    const stats = await getSystemStats();
    const photographers = await User.find({ role: "photographer" }).select("name email status createdAt");

    let csv = "PixLand System Report\n";
    csv += `Generated At: ${new Date().toLocaleString()}\n\n`;
    csv += "CORE METRICS\n";
    csv += `Total Users,${stats.totalUsers}\n`;
    csv += `Total Events,${stats.totalEvents}\n`;
    csv += `Total Photos,${stats.totalPhotos}\n`;
    csv += `Total Photographers,${stats.totalPhotographers}\n\n`;

    csv += "PHOTOGRAPHERS LIST\n";
    csv += "Name,Email,Status,Joined At\n";
    photographers.forEach(p => {
        csv += `${p.name},${p.email},${p.status},${p.createdAt}\n`;
    });

    return csv;
};

const getPhotographerStats = async (photographerId) => {
    // ... existing implementation remains (unchanged)
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
    getPhotographerStats,
    generateSystemReport
};
