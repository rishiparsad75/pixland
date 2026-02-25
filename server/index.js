console.log("==========================================");
console.log("PIXLAND BACKEND VERSION: v1.0.5-FINAL");
console.log("STARTUP TIME:", new Date().toISOString());
console.log("==========================================");

require("dotenv").config();

const dns = require('dns');
// Force Google DNS to resolve MongoDB Atlas SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log("[Setup] DNS servers set to Google Public DNS.");
} catch (err) {
    console.warn("[Setup] Warning: Could not set custom DNS servers.", err.message);
}

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const auth = require("./src/middleware/authMiddleware");
console.log("[Critical Check] auth.protect type in index.js:", typeof auth.protect);
if (typeof auth.protect !== 'function') {
    console.error("[CRITICAL ERROR] auth.protect IS NOT A FUNCTION IN index.js!");
}

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            process.env.FRONTEND_URL,
            "https://www.pixland.tech",
            "https://pixland.tech",
            "http://www.pixland.tech",
            "http://pixland.tech",
            "https://zealous-plant-0e819f000.6.azurestaticapps.net",
            "https://pixland-frontend.azurewebsites.net",
            "https://pixland-api-rishi-g9f8dbczb4f8cscc.centralindia-01.azurewebsites.net",
            "https://pixland-api-rishi-g9f0dpezb4f0cscc.centralindia-01.azurewebsites.net"
        ]
        : "*",
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoints (registered FIRST so Azure probe works immediately)
app.get("/", (req, res) => res.send("PixLand Backend Running (v1.0.5-FINAL)"));
app.get("/api/health", (req, res) => res.json({ status: "ok", version: "1.0.5-FINAL", time: new Date() }));
app.get("/api/face/system-load", (req, res) => {
    const { getServiceStatus } = require("./src/services/faceService");
    const status = getServiceStatus();
    res.json({
        ...status,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
    });
});

// Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? [
                process.env.FRONTEND_URL,
                "https://www.pixland.tech",
                "https://pixland.tech",
                "https://zealous-plant-0e819f000.6.azurestaticapps.net",
            ]
            : "*",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Load routes with individual error handling
const loadRoute = (path, routeFile) => {
    try {
        const route = require(routeFile);
        app.use(path, route);
        console.log(`[Routes] Loaded: ${path}`);
    } catch (err) {
        console.error(`[Routes] FAILED to load ${path}:`, err.message);
    }
};

loadRoute("/api/upload", "./src/routes/uploadRoute");
loadRoute("/api/users", "./src/routes/authRoute");
loadRoute("/api/images", "./src/routes/imageRoute");
loadRoute("/api/albums", "./src/routes/albumRoute");
loadRoute("/api/face", "./src/routes/faceRoute");
loadRoute("/api/events", "./src/routes/eventRoute");
loadRoute("/api/analytics", "./src/routes/analyticsRoute");
loadRoute("/api/subscription", "./src/routes/subscriptionRoute");

// Connect to MongoDB (non-blocking)
const connectDB = require("./src/config/db");
connectDB().then(async () => {
    console.log("[DB] Connected to MongoDB.");
    try {
        const User = require("./src/models/User");
        const result = await User.updateMany(
            { role: "photographer", status: "pending" },
            { $set: { status: "active" } }
        );
        if (result.modifiedCount > 0) {
            console.log(`[Migration] Activated ${result.modifiedCount} pending photographers.`);
        }
    } catch (err) {
        console.error("[Migration] Error:", err.message);
    }

    // Initialize Face Service (Large Memory Load)
    const { initFaceService } = require("./src/services/faceService");
    initFaceService().then(res => {
        if (res.success) {
            console.log(`[FaceService] Initialized with ${res.count} descriptors.`);
        } else {
            console.warn("[FaceService] Initialization had issues:", res.error);
        }
    });
}).catch(err => {
    console.error("[DB] MongoDB connection failed:", err.message);
    // Don't exit — server still runs, routes will fail gracefully
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`[Startup] PixLand Backend running on port ${PORT}`);
    console.log(`[Startup] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Clean deployment trigger v1.0.5 FINAL