import express from "express";
import { createReview, getAllReviews, markHelpful } from "../controller/review.controller.js";

const reviewRoute = express.Router();

reviewRoute.get("/all", getAllReviews);
reviewRoute.post("/create", createReview);
reviewRoute.post("/helpful/:id", markHelpful);

export default reviewRoute;
