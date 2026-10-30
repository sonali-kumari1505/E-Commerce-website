import { configDotenv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
configDotenv({ path: path.resolve(__dirname, "../../../.env"), quiet: true });
configDotenv({ path: path.resolve(__dirname, "../../.env"), quiet: true });

export const ENV={
    PORT: process.env.PORT || 5001,
    MONGO_URI: process.env.MONGO_URI,
    JWT_TOKEN: process.env.JWT_TOKEN,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_SECRET: process.env.API_SECRET,
    API_KEY: process.env.API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash-lite",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
    EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
    EMAIL_USER: process.env.EMAIL_USER || process.env.ADMIN_EMAIL || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    EMAIL_FROM: process.env.EMAIL_FROM || "E-Mart <noreply@emart.com>"
}
