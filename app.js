// Import packages we need
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import stationRoutes from "./routes/stationRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

// Get current file and directory paths (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();

// Allow requests from other websites (CORS)
app.use(cors());

// Parse incoming JSON data in request bodies
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// =========================
// API ROUTES
// =========================

// Authentication routes
// POST /api/v1/auth/login
app.use("/api/v1/auth", authRoutes);

// Station routes
// GET /api/v1/stations
app.use("/api/v1/stations", stationRoutes);

// Announcement routes
// GET  /api/v1/stations/:stationId/announcements
// POST /api/v1/stations/:stationId/announcements
app.use("/api/v1/stations", announcementRoutes);

// =========================
// HEALTH CHECK
// =========================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// =========================
// CENTRAL ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
  console.error(err);

  // Use an error status if one was provided,
  // otherwise default to 500.
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
});

export default app;