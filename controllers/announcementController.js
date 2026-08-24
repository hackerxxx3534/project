import { validationResult } from "express-validator";
import {
  getAnnouncementsForStation,
  createAnnouncement,
} from "../services/announcementService.js";
import { getIo } from "../sockets/ioInstance.js";

// GET announcements
export async function getAnnouncementsController(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { stationId } = req.params;

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const text = req.query.text || "";

    const result = await getAnnouncementsForStation(
      stationId,
      page,
      limit,
      text
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// POST announcement
export async function createAnnouncementController(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { stationId } = req.params;
    const { text } = req.body;

    const announcement = await createAnnouncement(stationId, text);

    // Broadcast to everyone watching this station
    const io = getIo();

    if (io) {
      io.to(stationId).emit("announcement", announcement);
    }

    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
}