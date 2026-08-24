
import request from "supertest";
import app from "../app.js";

describe("MetroSync API Integration Tests", () => {
  let token;

  test("GET /api/v1/stations returns 200", async () => {
    const response = await request(app)
      .get("/api/v1/stations");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /api/v1/auth/login with valid credentials returns a token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@metrosync.com",
        password: "Admin123!",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");

    token = response.body.token;
  });

  test("POST announcement without token returns 401", async () => {
    const response = await request(app)
      .post("/api/v1/stations/helwan/announcements")
      .send({
        text: "This should fail",
      });

    expect(response.statusCode).toBe(401);
  });
});

