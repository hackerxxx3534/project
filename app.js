import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import stationRoutes from "./routes/stationRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/stations", stationRoutes);

// IMPORTANT: announcements are mounted under /stations
app.use("/api/v1/stations", announcementRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;