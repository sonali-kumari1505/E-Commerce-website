import mongoose from "mongoose";
import { User } from "../model/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from "../config/env.js";
import cloudinary from "../config/cloudinary.js";
import { sendResetPasswordEmail } from "../config/email.js";

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
};

const checkDbConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            message: "Database is unreachable. Please ensure your IP is whitelisted in MongoDB Atlas Network Access."
        });
        return false;
    }
    return true;
};

export const register = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;
        const { name, password, email } = req.body;

        if (!name || !password || !email) {
            return res.status(400).json({
                message: "Please provide all the details"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const isOwner = normalizedEmail === (ENV.ADMIN_EMAIL || '').toLowerCase().trim();

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword,
            owner: isOwner
        });

        const token = jwt.sign({ userId: user._id }, ENV.JWT_TOKEN);

        return res.status(201).cookie("token", token, cookieOptions).json({
            message: `Welcome ${user.name}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                owner: user.owner,
                profilePhoto: user.profilePhoto,
                cartItem: user.cartItem
            }
        });
    } catch (error) {
        console.error("Error from register controller:", error);
        return res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

export const login = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign({ userId: user._id }, ENV.JWT_TOKEN);

        if (normalizedEmail === (ENV.ADMIN_EMAIL || '').toLowerCase().trim()) {
            user.owner = true;
            await user.save();
            return res.status(200).cookie("token", token, cookieOptions).json({
                message: `Welcome back Admin ${user.name}`,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    owner: true,
                    profilePhoto: user.profilePhoto,
                    cartItem: user.cartItem
                }
            });
        }

        return res.status(200).cookie("token", token, cookieOptions).json({
            message: `Welcome back ${user.name}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                owner: user.owner,
                profilePhoto: user.profilePhoto,
                cartItem: user.cartItem
            }
        });
    } catch (error) {
        console.error("Error from login controller:", error);
        return res.status(500).json({ message: "Login failed. Please try again." });
    }
};

export const getUser = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error from getUser controller:", error);
        return res.status(500).json({ message: "Failed to fetch user data" });
    }
};

export const getCartItem = async (req, res) => {
    try {
        const userId = req.id;

        const user = await User.findById(userId).populate({
            path: 'cartItem',
            populate: {
                path: 'product',
                model: "Product"
            }
        }).select('cartItem');

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error from getCartItem controller:", error);
        return res.status(500).json({ message: "Failed to fetch cart items" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { name } = req.body;
        const updateData = {};

        if (name && name.trim()) {
            updateData.name = name.trim();
        }

        if (req.file) {
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const uploadRes = await cloudinary.uploader.upload(base64, {
                folder: "ProfilePhoto"
            });
            updateData.profilePhoto = uploadRes.secure_url;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.error("Error from updateProfile controller:", error);
        return res.status(500).json({ message: "Failed to update profile" });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", {
            ...cookieOptions,
            maxAge: 0,
            expires: new Date(0)
        }).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Error from logout controller:", error);
        return res.status(500).json({ message: "Failed to logout" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Please provide an email address" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email address"
            });
        }

        // Generate unhashed random token for the URL
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Store SHA-256 hash of the token in database for security
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
        await user.save();

        const resetUrl = `${ENV.CLIENT_URL}/reset-password/${resetToken}`;
        await sendResetPasswordEmail(user.email, resetUrl);

        return res.status(200).json({
            message: "Password reset link has been sent to your email.",
            resetUrl: !ENV.EMAIL_PASS ? resetUrl : undefined
        });
    } catch (error) {
        console.error("Error from forgotPassword controller:", error);
        return res.status(500).json({ message: "Failed to process forgot password request: " + (error?.message || error) });
    }
};

export const resetPassword = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Reset token is required" });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Password reset link is invalid or has expired. Please request a new one."
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({
            message: "Password has been successfully reset! You can now login with your new password."
        });
    } catch (error) {
        console.error("Error from resetPassword controller:", error);
        return res.status(500).json({ message: "Failed to reset password" });
    }
};
