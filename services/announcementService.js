import Announcement from "../models/Announcement.js";

// Get announcements for a station
// Newest first, with pagination and optional text filtering
export async function getAnnouncementsForStation(
  stationId,
  page = 1,
  limit = 20,
  text = ""
) {
  const skip = (page - 1) * limit;

  const filter = {
    stationId,
  };

  // Optional text filtering
  if (text) {
    filter.text = {
      $regex: text,
      $options: "i",
    };
  }

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Announcement.countDocuments(filter),
  ]);

  return {
    announcements,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Create a new announcement
export async function createAnnouncement(stationId, text) {
  const doc = await Announcement.create({
    stationId,
    text,
  });

  return doc.toObject();
}