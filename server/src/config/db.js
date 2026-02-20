const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    // Only exit process in production to let orchestrator restart it
    if (process.env.NODE_ENV === 'production') {
      console.error("[Database] Exiting process due to connection failure in production.");
      process.exit(1);
    }
  }
};

module.exports = connectDB;
