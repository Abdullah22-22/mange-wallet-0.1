
import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

process.env.jwt = "testsecret";

const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockFindById = jest.fn();
const mockCompare = jest.fn();
const mockVerify = jest.fn();
const mockAccessToken = jest.fn();
const mockRefreshToken = jest.fn();
const mockCreateJsonWebToken = jest.fn(() => "fake-jwt-token");

// mock model
await jest.unstable_mockModule("../modules/Auth/userModel.js", () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
    findById: mockFindById,
  },
}));

// mock bcrypt
await jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: mockCompare,
  },
}));

// mock jwt
await jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockVerify,
  },
}));

// mock cookies helpers
await jest.unstable_mockModule("../utils/cookies.js", () => ({
  AccessToken: mockAccessToken,
  RefreshToken: mockRefreshToken,
}));

// mock jwt helper
await jest.unstable_mockModule("../utils/Jsonwebtoken.js", () => ({
  CreateJsonWebToken: mockCreateJsonWebToken,
}));

// mock validation chains
await jest.unstable_mockModule("../utils/valid.js", () => ({
  UserLogin: [],
  UserReg: [],
  ChangePasswordValid: [],
  ForgotPasswordValid: [],
  ResetPasswordValid: [],
}));

// mock validate middleware
await jest.unstable_mockModule("../Middleware/validate.js", () => ({
  validate: (req, res, next) => next(),
}));

// mock protect middleware
await jest.unstable_mockModule("../Middleware/authe.js", () => ({
  protect: (req, res, next) => {
    req.userId = "123";
    next();
  },
}));

const { default: userRouter } = await import("../routes/Auth/userRouter.js");
const { errorHandler } = await import("../Middleware/errorHandler.js");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRouter);
app.use(errorHandler);

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        _id: "123",
        name: "Abdul",
        email: "abdul@test.com",
        password: "hashedpassword",
        toObject() {
          return {
            _id: "123",
            name: "Abdul",
            email: "abdul@test.com",
            password: "hashedpassword",
          };
        },
      });

      const res = await request(app).post("/api/users/register").send({
        name: "Abdul",
        email: "abdul@test.com",
        password: "123456",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User registered successfully");
      expect(res.body.user.email).toBe("abdul@test.com");
    });

    it("should not register existing user", async () => {
      mockFindOne.mockResolvedValue({ email: "abdul@test.com" });

      const res = await request(app).post("/api/users/register").send({
        name: "Abdul",
        email: "abdul@test.com",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });
  });

  describe("POST /api/users/login", () => {
    it("should login successfully", async () => {
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "123",
          name: "Abdul",
          email: "abdul@test.com",
          password: "hashedpassword",
          toObject() {
            return {
              _id: "123",
              name: "Abdul",
              email: "abdul@test.com",
              password: "hashedpassword",
            };
          },
        }),
      });

      mockCompare.mockResolvedValue(true);

      const res = await request(app).post("/api/users/login").send({
        email: "abdul@test.com",
        password: "123456",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Login successful");
      expect(res.body.user.email).toBe("abdul@test.com");
      expect(res.body.token).toBe("fake-jwt-token");
    });

    it("should fail if user does not exist", async () => {
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).post("/api/users/login").send({
        email: "wrong@test.com",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should fail if password is incorrect", async () => {
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "123",
          email: "abdul@test.com",
          password: "hashedpassword",
          toObject() {
            return {
              _id: "123",
              email: "abdul@test.com",
              password: "hashedpassword",
            };
          },
        }),
      });

      mockCompare.mockResolvedValue(false);

      const res = await request(app).post("/api/users/login").send({
        email: "abdul@test.com",
        password: "wrongpass",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/users/renew", () => {
    it("should return 401 if no refresh token provided", async () => {
      const res = await request(app).get("/api/users/renew");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("No refresh token provided");
    });

    it("should renew access token successfully", async () => {
      mockVerify.mockReturnValue({
        sub: "123",
        authType: "local",
      });

      mockFindById.mockResolvedValue({
        _id: "123",
        name: "Abdul",
        email: "abdul@test.com",
        password: "hashedpassword",
        toObject() {
          return {
            _id: "123",
            name: "Abdul",
            email: "abdul@test.com",
            password: "hashedpassword",
          };
        },
      });

      const res = await request(app)
        .get("/api/users/renew")
        .set("Cookie", ["RefreshToken=faketoken"]);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Access token renewed successfully");
      expect(res.body.user.email).toBe("abdul@test.com");
    });
  });
});
