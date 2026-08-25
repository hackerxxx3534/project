import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./db.js";
import { ensureAdminSeed } from "./services/authService.js";
import setupSockets from "./sockets/main.js";
import dotenv from "dotenv";

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setupSockets(io);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    await ensureAdminSeed();

    server.listen(PORT, () => {
      console.log(
        `MetroSync Live running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();