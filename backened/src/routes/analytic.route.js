import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middlware.js";
import { getAnalyticsController, getDailySalesController } from "../controller/analytics.controller.js";

const analyticRoute = express.Router();

analyticRoute.get('/getDate', protectRoute, adminRoute, getAnalyticsController);
analyticRoute.get('/getData', protectRoute, adminRoute, getAnalyticsController);
analyticRoute.get('/dailySales', protectRoute, adminRoute, getDailySalesController);

export default analyticRoute;
