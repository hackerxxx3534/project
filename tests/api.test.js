import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import { connectDB } from "../db.js";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("MetroSync API", () => {
  test("GET /health returns 200", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("GET /api/v1/stations returns 200", async () => {
    const response = await request(app).get("/api/v1/stations");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST announcement without token returns 401", async () => {
    const response = await request(app)
      .post("/api/v1/stations/helwan/announcements")
      .send({
        text: "Unauthorized test announcement",
      });

    expect(response.statusCode).toBe(401);
  });
});