import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../model/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required. Please login."
            });
        }

        const decode = jwt.verify(token, ENV.JWT_TOKEN);

        if (!decode || !decode.userId) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.id = decode.userId;
        next();
    } catch (error) {
        console.error(`Error from protectRoute middleware:`, error?.message || error);
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export const adminRoute = async (req, res, next) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                message: "Please login as an Admin"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.email === ENV.ADMIN_EMAIL || user.owner) {
            next();
        } else {
            return res.status(403).json({
                message: "Access denied, Admin only"
            });
        }
    } catch (error) {
        console.error(`Error from adminRoute middleware:`, error?.message || error);
        return res.status(500).json({
            message: "Server error in admin authorization"
        });
    }
};
