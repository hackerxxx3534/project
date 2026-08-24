import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function ensureAdminSeed() {
  const adminEmail = "admin@metrosync.com";

  const existing = await User.findOne({ email: adminEmail });

  if (existing) return;

  const hash = await bcrypt.hash("Admin123!", 10);

  await User.create({
    email: adminEmail,
    passwordHash: hash,
    role: "admin",
  });

  console.log(
    "Seeded default admin: admin@metrosync.com / Admin123!"
  );
}

export async function login(email, password) {
  const user = await User.findOne({ email });

  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) return null;

  const payload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  return {
    token,
    role: user.role,
    email: user.email,
  };
}