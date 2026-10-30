import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: 1,
            max: 5
        },
        title: {
            type: String,
            required: [true, "Review title is required"],
            trim: true
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            trim: true
        },
        verified: {
            type: Boolean,
            default: true
        },
        helpful: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
