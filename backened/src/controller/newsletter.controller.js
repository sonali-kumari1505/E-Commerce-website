import mongoose from "mongoose";
import { Newsletter } from "../model/newsletter.model.js";
import { sendNewsletterWelcomeEmail } from "../config/email.js";

const checkDbConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            message: "Database is unreachable. Please ensure database connection is established."
        });
        return false;
    }
    return true;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeNewsletter = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;

        const { email } = req.body;

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Email address is required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        const existingSubscriber = await Newsletter.findOne({ email: normalizedEmail });

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(200).json({
                    success: true,
                    alreadySubscribed: true,
                    message: "You're already subscribed to our newsletter!"
                });
            } else {
                existingSubscriber.isActive = true;
                await existingSubscriber.save();
                
                // Fire welcome email asynchronously without blocking response
                sendNewsletterWelcomeEmail(normalizedEmail).catch((err) =>
                    console.error("Welcome email error:", err?.message || err)
                );

                return res.status(200).json({
                    success: true,
                    message: "Welcome back! Your newsletter subscription has been reactivated."
                });
            }
        }

        const newSubscriber = await Newsletter.create({
            email: normalizedEmail,
            isActive: true
        });

        // Fire welcome email asynchronously
        sendNewsletterWelcomeEmail(normalizedEmail).catch((err) =>
            console.error("Welcome email error:", err?.message || err)
        );

        return res.status(201).json({
            success: true,
            message: "Thank you for subscribing to our newsletter!",
            subscriber: {
                id: newSubscriber._id,
                email: newSubscriber.email
            }
        });
    } catch (error) {
        // Handle MongoDB duplicate key race condition
        if (error.code === 11000) {
            return res.status(200).json({
                success: true,
                alreadySubscribed: true,
                message: "You're already subscribed to our newsletter!"
            });
        }

        console.error("Newsletter subscription error:", error);
        return res.status(500).json({
            message: "Failed to process subscription. Please try again later."
        });
    }
};

export const unsubscribeNewsletter = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const subscriber = await Newsletter.findOne({ email: normalizedEmail });

        if (!subscriber) {
            return res.status(404).json({ message: "Email not found in our subscriber list." });
        }

        subscriber.isActive = false;
        await subscriber.save();

        return res.status(200).json({
            success: true,
            message: "You have been unsubscribed from our newsletter."
        });
    } catch (error) {
        console.error("Newsletter unsubscribe error:", error);
        return res.status(500).json({
            message: "Failed to unsubscribe. Please try again later."
        });
    }
};

export const getSubscribers = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;

        const subscribers = await Newsletter.find({ isActive: true })
            .sort({ createdAt: -1 })
            .select("email createdAt");

        return res.status(200).json({
            count: subscribers.length,
            subscribers
        });
    } catch (error) {
        console.error("Get subscribers error:", error);
        return res.status(500).json({
            message: "Failed to fetch subscribers."
        });
    }
};
