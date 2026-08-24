import { validationResult } from "express-validator";
import { login } from "../services/authService.js";

export async function loginController(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const result = await login(email, password);

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}