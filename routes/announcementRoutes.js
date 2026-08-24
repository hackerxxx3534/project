import express from "express";
import { body, param, query } from "express-validator";

import {
  getAnnouncementsController,
  createAnnouncementController,
} from "../controllers/announcementController.js";

import { requireAdmin } from "../middleware/middleware.auth.js";

const router = express.Router();

// GET /api/v1/announcements/:stationId
// Public - passengers can read announcements
router.get(
  "/:stationId",
  [
    param("stationId")
      .trim()
      .notEmpty()
      .withMessage("Station ID is required."),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer."),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100."),

    query("text")
      .optional()
      .trim(),
  ],
  getAnnouncementsController
);

// POST /api/v1/announcements/:stationId
// Protected - only admins can create announcements
router.post(
  "/:stationId",
  requireAdmin,
  [
    param("stationId")
      .trim()
      .notEmpty()
      .withMessage("Station ID is required."),

    body("text")
      .trim()
      .notEmpty()
      .withMessage("Announcement text is required.")
      .isLength({ max: 500 })
      .withMessage("Announcement text cannot exceed 500 characters."),
  ],
  createAnnouncementController
);

export default router;