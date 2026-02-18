require("dotenv").config();
const dns = require('dns');
// Force Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require("./src/models/User");
const runMigrations = async () => {
  try {
    const result = await User.updateMany(
      { role: "photographer", status: "pending" },
      { $set: { status: "active" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Migration] Activated ${result.modifiedCount} pending photographers.`);
    }
  } catch (err) {
    console.error("[Migration] Error:", err);
  }
};

const connectDB = require("./src/config/db");
connectDB().then(() => {
  runMigrations();
});

const express = require("express");
const cors = require("cors");

const uploadRoute = require("./src/routes/uploadRoute");
const authRoute = require("./src/routes/authRoute");
const imageRoute = require("./src/routes/imageRoute");
const albumRoute = require("./src/routes/albumRoute");
const faceRoute = require("./src/routes/faceRoute");
const eventRoute = require("./src/routes/eventRoute");
const analyticsRoute = require("./src/routes/analyticsRoute");
const subscriptionRoute = require("./src/routes/subscriptionRoute");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL, "https://www.pixland.tech", "https://zealous-plant-0e819f000.6.azurestaticapps.net"]
      : "*",
    methods: ["GET", "POST"]
  }
});

// Store io instance in app to access in routes
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

// CORS configuration for Express
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, "https://www.pixland.tech", "https://zealous-plant-0e819f000.6.azurestaticapps.net"]
    : "*",
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PixLand Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.use("/api/upload", uploadRoute);
app.use("/api/users", authRoute);
app.use("/api/images", imageRoute);
app.use("/api/albums", albumRoute);
app.use("/api/face", faceRoute);
app.use("/api/events", eventRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/subscription", subscriptionRoute);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
