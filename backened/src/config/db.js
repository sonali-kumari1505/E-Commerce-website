import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnecting = false;

export const connectDB = async () => {
    if (isConnecting || mongoose.connection.readyState === 1) return;
    isConnecting = true;

    try {
        console.log(`[Database] Connecting to MongoDB Atlas...`);
        await mongoose.connect(ENV.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`[Database] Connected successfully (ReadyState: ${mongoose.connection.readyState})`);
        isConnecting = false;
    } catch (error) {
        isConnecting = false;
        console.error("\n======================================================");
        console.error("⚠️  MONGODB CONNECTION FAILED:");
        console.error(error.message);
        console.error("Most likely cause: MongoDB Atlas IP Whitelist.");
        console.error("Please add your IP address (or 0.0.0.0/0) to MongoDB Atlas > Network Access.");
        console.error("The server will retry connecting automatically every 10 seconds...");
        console.error("======================================================\n");

        setTimeout(() => {
            if (mongoose.connection.readyState !== 1) {
                connectDB();
            }
        }, 10000);
    }
};
