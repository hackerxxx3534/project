import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { loginController } from "../controllers/authController.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required."),

  body("password")
    .isString()
    .notEmpty()
    .withMessage("Password is required."),
];

router.post(
  "/login",
  loginLimiter,
  loginValidation,
  loginController
);

export default router;