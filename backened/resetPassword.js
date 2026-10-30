import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/model/user.model.js";
import { ENV } from "./src/config/env.js";

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log("Usage: node resetPassword.js <email> <newPassword>");
  process.exit(1);
}

async function reset() {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log(`User with email "${email}" not found.`);
      process.exit(1);
    }
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    console.log(`Success: Password for "${user.email}" updated to "${newPassword}".`);
    process.exit(0);
  } catch (err) {
    console.error("Error resetting password:", err.message);
    process.exit(1);
  }
}

reset();
