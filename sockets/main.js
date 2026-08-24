// Import function to save socket.io instance
import { setIo } from "./ioInstance.js";

// Store the station each socket is currently watching
const socketStations = new Map();

// Main Socket.io setup
export default function setupSockets(io) {
  // Save io instance so other files can use it
  setIo(io);

  // When a user connects
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // User joins a station
    socket.on("joinStation", (stationId) => {
      if (!stationId) return;

      // If the user was already watching another station,
      // remove them from that room first
      const previousStation = socketStations.get(socket.id);

      if (previousStation && previousStation !== stationId) {
        socket.leave(previousStation);

        io.to(previousStation).emit("presenceUpdate", {
          stationId: previousStation,
          watchers: io.sockets.adapter.rooms.get(previousStation)?.size || 0,
        });
      }

      // Join the new station room
      socket.join(stationId);

      // Remember which station this socket is watching
      socketStations.set(socket.id, stationId);

      // Count viewers in the room
      const watchers =
        io.sockets.adapter.rooms.get(stationId)?.size || 0;

      // Tell everyone watching this station
      io.to(stationId).emit("presenceUpdate", {
        stationId,
        watchers,
      });

      console.log(
        `Socket ${socket.id} joined ${stationId}. Viewers: ${watchers}`
      );
    });

    // User leaves a station
    socket.on("leaveStation", (stationId) => {
      if (!stationId) return;

      socket.leave(stationId);

      // Remove stored station if this was the current one
      if (socketStations.get(socket.id) === stationId) {
        socketStations.delete(socket.id);
      }

      // Count remaining viewers
      const watchers =
        io.sockets.adapter.rooms.get(stationId)?.size || 0;

      // Update everyone still watching that station
      io.to(stationId).emit("presenceUpdate", {
        stationId,
        watchers,
      });

      console.log(
        `Socket ${socket.id} left ${stationId}. Viewers: ${watchers}`
      );
    });

    // User closes browser/tab or loses connection
    socket.on("disconnect", () => {
      const stationId = socketStations.get(socket.id);

      if (stationId) {
        socketStations.delete(socket.id);

        // Socket.IO automatically removes the socket from rooms
        // when it disconnects, so calculate the remaining viewers.
        setTimeout(() => {
          const watchers =
            io.sockets.adapter.rooms.get(stationId)?.size || 0;

          io.to(stationId).emit("presenceUpdate", {
            stationId,
            watchers,
          });
        }, 0);
      }

      console.log("Socket disconnected:", socket.id);
    });
  });
}