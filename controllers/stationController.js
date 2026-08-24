import { getAllStations } from "../services/stationService.js";

export async function getStations(req, res, next) {
  try {
    const stations = await getAllStations();
    res.status(200).json(stations);
  } catch (error) {
    next(error);
  }
}