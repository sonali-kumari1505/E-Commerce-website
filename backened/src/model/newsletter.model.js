import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"]
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const Newsletter = mongoose.model("Newsletter", newsletterSchema);
