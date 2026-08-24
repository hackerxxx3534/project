// Import shared utilities
import {
  appState,
  handleStationChange,
  initializeTrain,
  loadStationsWithPreload,
  populateStationDropdown,
  renderMap,
  setupSocketListeners,
  startClientSideTrainAnimation,
} from "./shared-utils.js";

// Connect to Socket.IO
const socket = io();

// Get HTML elements
const stationSelect = document.getElementById("station-select");
const stationTitle = document.getElementById("station-title");
const mapTitle = document.getElementById("map-title");
const mapLine = document.getElementById("map-line");
const announcementList = document.getElementById("announcement-list");
const viewersText = document.getElementById("viewers-text");

// Load and initialize everything
async function init() {
  try {
    // Load stations
    appState.stations = await loadStationsWithPreload();

    // Populate dropdown
    populateStationDropdown(stationSelect);

    // Draw map
    renderMap(mapLine);

    // Create train
    initializeTrain(mapLine);

    // Start train animation
    startClientSideTrainAnimation();

    // Setup Socket.io listeners
    setupSocketListeners(
      socket,
      announcementList,
      viewersText
    );

    console.log("Passenger app initialized");
  } catch (error) {
    console.error("Passenger initialization failed:", error);
  }
}

// When user selects a station
stationSelect.addEventListener("change", async (e) => {
  const stationId = e.target.value;

  if (!stationId) return;

  const handler = handleStationChange(
    socket,
    stationId,
    [stationTitle, mapTitle],
    announcementList,
    mapLine
  );

  await handler();
});

// Socket connection logging
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

// Start application
init();