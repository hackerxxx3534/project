

// Train animation timing configuration
export const TRAIN_CONFIG = {
  STOP_TIME: 3000,
  MOVE_TIME: 12000,
};

// Shared app state
export const appState = {
  stations: [],
  currentStationId: null,
  currentTrainStationId: null,
  trainElement: null,
  currentTrainIndex: 0,
  isMovingForward: true,
};

// Move train to a specific station position
export function updateTrainPosition(index, isMoving = false) {
  if (appState.stations.length === 0 || !appState.trainElement) {
    return;
  }

  const denominator = Math.max(appState.stations.length - 1, 1);
  const trainPosition = (index / denominator) * 100;

  if (isMoving) {
    appState.trainElement.style.transition =
      `left ${TRAIN_CONFIG.MOVE_TIME / 1000}s ease-in-out`;
  } else {
    appState.trainElement.style.transition = "none";
  }

  appState.trainElement.style.left =
    `calc(${trainPosition}% - 24px)`;

  appState.currentTrainIndex = index;
  appState.currentTrainStationId =
    appState.stations[index].id;
}

// Start train animation
export function startClientSideTrainAnimation() {
  if (appState.stations.length === 0) {
    return;
  }

  const moveToNextStation = () => {
    updateTrainPosition(
      appState.currentTrainIndex,
      false
    );

    setTimeout(() => {
      if (appState.isMovingForward) {
        if (
          appState.currentTrainIndex <
          appState.stations.length - 1
        ) {
          appState.currentTrainIndex++;
        } else {
          appState.isMovingForward = false;
          appState.currentTrainIndex--;
        }
      } else {
        if (appState.currentTrainIndex > 0) {
          appState.currentTrainIndex--;
        } else {
          appState.isMovingForward = true;
          appState.currentTrainIndex++;
        }
      }

      updateTrainPosition(
        appState.currentTrainIndex,
        true
      );

      setTimeout(
        moveToNextStation,
        TRAIN_CONFIG.MOVE_TIME
      );
    }, TRAIN_CONFIG.STOP_TIME);
  };

  moveToNextStation();
}

// Draw station dots
export function renderMap(mapLine) {
  if (!mapLine) {
    return;
  }

  const existingDots =
    mapLine.querySelectorAll(".station-dot");

  existingDots.forEach((dot) => dot.remove());

  appState.stations.forEach((station, index) => {
    const dot = document.createElement("div");

    dot.className =
      "station-dot" +
      (
        station.id === appState.currentStationId
          ? " selected"
          : ""
      );

    dot.dataset.id = station.id;
    dot.dataset.index = index;

    const label = document.createElement("span");
    label.textContent = station.name;

    dot.appendChild(label);
    mapLine.appendChild(dot);
  });
}

// Create train
export function initializeTrain(mapLine) {
  if (!mapLine) {
    return;
  }

  if (!appState.trainElement) {
    appState.trainElement =
      document.createElement("div");

    appState.trainElement.className =
      "train-icon";

    appState.trainElement.textContent = "🚆";

    mapLine.appendChild(
      appState.trainElement
    );
  }

  appState.currentTrainIndex = 0;

  updateTrainPosition(
    0,
    false
  );
}

// Populate station dropdown
export function populateStationDropdown(
  selectElement
) {
  if (!selectElement) {
    return;
  }

  selectElement.innerHTML =
    "<option value=''>Select Station</option>" +
    appState.stations
      .map(
        (station) =>
          `<option value="${station.id}">${station.name}</option>`
      )
      .join("");
}

// Get announcements for a station
export async function loadAnnouncements(
  stationId,
  token = null
) {
  const headers = token
    ? {
        Authorization:
          "Bearer " + token,
      }
    : {};

  const url =
    `/api/v1/stations/${encodeURIComponent(
      stationId
    )}/announcements`;

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    let message =
      "Failed to load announcements";

    try {
      const body = await res.json();

      if (body.message) {
        message = body.message;
      }
    } catch (error) {
      // Response was not JSON
    }

    throw new Error(message);
  }

  const data = await res.json();

  // API returns an array
  if (Array.isArray(data)) {
    return data;
  }

  // Also support { announcements: [...] }
  if (
    data &&
    Array.isArray(data.announcements)
  ) {
    return data.announcements;
  }

  console.error(
    "Unexpected announcements response:",
    data
  );

  return [];
}

// Add one announcement
export function addAnnouncementToList(
  announcementList,
  announcement,
  toTop = false
) {
  if (!announcementList || !announcement) {
    return;
  }

  const li = document.createElement("li");

  li.className =
    "announcement-item";

  const time = new Date(
    announcement.createdAt ||
      Date.now()
  );

  li.innerHTML = `
    <div>${announcement.text || ""}</div>
    <time>${time.toLocaleTimeString()}</time>
  `;

  if (
    toTop &&
    announcementList.firstChild
  ) {
    announcementList.insertBefore(
      li,
      announcementList.firstChild
    );
  } else {
    announcementList.appendChild(li);
  }
}

// Display announcements
export function displayAnnouncements(
  announcementList,
  announcements
) {
  if (!announcementList) {
    return;
  }

  announcementList.innerHTML = "";

  if (!Array.isArray(announcements)) {
    console.error(
      "Expected announcements array:",
      announcements
    );

    return;
  }

  if (announcements.length === 0) {
    const li =
      document.createElement("li");

    li.className =
      "announcement-item";

    li.textContent =
      "No announcements.";

    announcementList.appendChild(li);

    return;
  }

  announcements.forEach(
    (announcement) => {
      addAnnouncementToList(
        announcementList,
        announcement,
        false
      );
    }
  );
}

// Fetch stations
export async function fetchStations(
  token = null
) {
  const headers = token
    ? {
        Authorization:
          "Bearer " + token,
      }
    : {};

  const res = await fetch(
    "/api/v1/stations",
    {
      method: "GET",
      headers,
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to load stations"
    );
  }

  const data =
    await res.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid stations response"
    );
  }

  return data;
}

// Load stations
export async function loadStationsWithPreload(
  token = null
) {
  if (
    window.preloadedData &&
    window.preloadedData.stations &&
    window.preloadedData.stations.length > 0
  ) {
    console.log(
      "Using preloaded stations"
    );

    return window.preloadedData.stations;
  }

  console.log(
    "Fetching stations from server"
  );

  return await fetchStations(token);
}

// Handle station selection
export function handleStationChange(
  socket,
  newStationId,
  titleElements,
  announcementList,
  mapLine,
  token = null
) {
  return async () => {
    if (!newStationId) {
      return;
    }

    // Leave previous station room
    if (appState.currentStationId) {
      socket.emit(
        "leaveStation",
        appState.currentStationId
      );
    }

    appState.currentStationId =
      newStationId;

    const selectedStation =
      appState.stations.find(
        (station) =>
          station.id ===
          newStationId
      );

    if (!selectedStation) {
      console.error(
        "Station not found:",
        newStationId
      );

      return;
    }

    // Update station titles
    titleElements.forEach(
      (element) => {
        if (element) {
          element.textContent =
            selectedStation.name;
        }
      }
    );

    // Join new station room
    socket.emit(
      "joinStation",
      appState.currentStationId
    );

    try {
      const announcements =
        await loadAnnouncements(
          appState.currentStationId,
          token
        );

      displayAnnouncements(
        announcementList,
        announcements
      );
    } catch (error) {
      console.error(
        "Failed to load announcements:",
        error
      );

      if (announcementList) {
        announcementList.innerHTML =
          "<li>Unable to load announcements.</li>";
      }
    }

    // Highlight selected station
    renderMap(mapLine);
  };
}

// Setup Socket.IO listeners
export function setupSocketListeners(
  socket,
  announcementList,
  viewersText
) {
  // New announcement
  socket.on(
    "announcement:new",
    (announcement) => {
      if (
        announcement &&
        announcement.stationId ===
          appState.currentStationId
      ) {
        addAnnouncementToList(
          announcementList,
          announcement,
          true
        );
      }
    }
  );

  // Support original event name too
  socket.on(
    "announcement",
    (announcement) => {
      if (
        announcement &&
        announcement.stationId ===
          appState.currentStationId
      ) {
        addAnnouncementToList(
          announcementList,
          announcement,
          true
        );
      }
    }
  );

  // Viewer count
  socket.on(
    "watcherCount",
    ({ stationId, count }) => {
      if (
        stationId ===
          appState.currentStationId &&
        viewersText
      ) {
        viewersText.textContent =
          "Live viewers: " + count;
      }
    }
  );

  // Support presenceUpdate
  socket.on(
    "presenceUpdate",
    ({ stationId, watchers }) => {
      if (
        stationId ===
          appState.currentStationId &&
        viewersText
      ) {
        viewersText.textContent =
          "Live viewers: " + watchers;
      }
    }
  );
}

