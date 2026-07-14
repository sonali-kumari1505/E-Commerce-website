import mongoose from "mongoose"
import { ENV } from "./env.js"

export const connectDB = async()=>{
    try {
        console.log(ENV.MONGO_URI);
        await mongoose.connect(ENV.MONGO_URI)
        console.log("db connected")
        console.log(mongoose.connection.readyState);
    } catch (error) {
        console.log(`error from connectDB, ${error}`)
    }
}