import express from "express";
import { getSubscribers, subscribeNewsletter, unsubscribeNewsletter } from "../controller/newsletter.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middlware.js";

const newsletterRoute = express.Router();

newsletterRoute.post("/subscribe", subscribeNewsletter);
newsletterRoute.post("/unsubscribe", unsubscribeNewsletter);
newsletterRoute.get("/subscribers", protectRoute, adminRoute, getSubscribers);

export default newsletterRoute;
