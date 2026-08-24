import Station from "../models/Station.js";

// Get all stations sorted by line and order
export async function getAllStations() {
  return await Station.find().sort({
    line: 1,
    order: 1,
  });
}

// Add multiple stations at once
export async function seedStations(stationsArray) {
  const operations = stationsArray.map((station) => ({
    updateOne: {
      filter: { id: station.id },
      update: { $set: station },
      upsert: true,
    },
  }));

  return await Station.bulkWrite(operations);
}