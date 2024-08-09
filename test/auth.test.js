const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const authController = require("../controllers/auth.controller");

process.env.JWT_SECRET = "INIRAHASIA";

// Middleware setup
app.use(bodyParser.json());

// Route setup
app.post("/auth/signin", authController.signin);
app.post("/auth/signout", authController.signout);

// Mock Prisma client and bcrypt
jest.mock("../config/prisma", () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

const bcrypt = require("bcrypt");
jest.mock("bcrypt");

describe("Auth Controller", () => {
  describe("POST /auth/signin", () => {
    it("should return a token for valid credentials", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        username: "john",
        password: bcrypt.hashSync("password", 10),
      };

      const payload = {
        username: "john",
        password: "password",
      };

      require("../config/prisma").user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);

      const response = await request(app).post("/auth/signin").send(payload);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toBeDefined();
    });

    it("should return an error for invalid username", async () => {
      const payload = {
        username: "john",
        password: "password",
      };

      require("../config/prisma").user.findUnique.mockResolvedValue(null);

      const response = await request(app).post("/auth/signin").send(payload);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid Username / Password");
    });

    it("should return an error for invalid password", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        username: "john",
        password: bcrypt.hashSync("password", 10),
      };

      const payload = {
        username: "john",
        password: "wrongpassword",
      };

      require("../config/prisma").user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(false);

      const response = await request(app).post("/auth/signin").send(payload);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid Username / Password");
    });

    it("should return validation error for missing fields", async () => {
      const payload = {
        username: "john",
        password: "",
      };

      const response = await request(app).post("/auth/signin").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toEqual([
        {
          actual: "",
          type: "stringEmpty",
          field: "password",
          message: "The 'password' field must not be empty.",
        },
      ]);
    });
  });

  describe("POST /auth/signout", () => {
    it("should return a success message", async () => {
      const response = await request(app).post("/auth/signout");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("success logout");
    });
  });
});
