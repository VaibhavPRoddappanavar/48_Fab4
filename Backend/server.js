import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import apiRoutes from "./api-routes.js";

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mern-app",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "🔒 Security Audit API - WebAuditAI",
    status: "Server is running successfully",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      audit: "POST /api/audit",
      status: "GET /api/audit/:id/status",
      results: "GET /api/audit/:id/results",
      download: "GET /api/audit/:id/download",
      health: "GET /api/health",
      audits: "GET /api/audits",
    },
  });
});

// Security Audit API routes
app.use("/api", apiRoutes);

// Legacy health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running successfully on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});
