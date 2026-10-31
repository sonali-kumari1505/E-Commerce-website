import express from "express";
import { ENV } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
import userRoute from "./src/routes/user.route.js";
import productRoute from "./src/routes/product.route.js";
import cartRoute from "./src/routes/cart.route.js";
import paymentRoute from "./src/routes/payment.route.js";
import analyticRoute from "./src/routes/analytic.route.js";
import newsletterRoute from "./src/routes/newsletter.route.js";
import reviewRoute from "./src/routes/review.route.js";
import cors from 'cors';

const app = express();

app.use(cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database connection is ready for incoming requests (including serverless on Vercel)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

app.use('/api', userRoute);
app.use('/api/product', productRoute);
app.use('/api/cart', cartRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/analytic', analyticRoute);
app.use('/api/newsletter', newsletterRoute);
app.use('/api/review', reviewRoute);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log(`Server started on ${ENV.PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to database:", error);
    }
};

// Start standalone HTTP server when run locally or on platforms like Render/Railway
if (!process.env.VERCEL) {
    startServer();
}

export default app;
