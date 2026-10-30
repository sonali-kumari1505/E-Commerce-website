import mongoose from "mongoose";
import { User } from "../model/user.model.js";

const checkDbConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            message: "Database is unreachable. Please ensure your IP is whitelisted in MongoDB Atlas Network Access."
        });
        return false;
    }
    return true;
};

export const addToCart = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;
        const { productId } = req.body;
        const userId = req.id;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existItem = user.cartItem.find((item) => item.product && item.product.toString() === productId);

        if (existItem) {
            return res.status(409).json({
                message: "Product is already in your cart"
            });
        }

        user.cartItem.push({ quantity: 1, product: productId });
        await user.save();

        return res.status(200).json({
            message: "Product added to your cart successfully",
            cartItem: user.cartItem
        });
    } catch (error) {
        console.error("Error from addToCart controller:", error);
        return res.status(500).json({ message: "Failed to add product to cart" });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.id;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.cartItem = user.cartItem.filter(
            (item) => item.product && item.product.toString() !== productId
        );
        await user.save();

        return res.status(200).json({
            message: "Product removed from cart successfully",
            cartItem: user.cartItem
        });
    } catch (error) {
        console.error("Error from removeFromCart controller:", error);
        return res.status(500).json({ message: "Failed to remove product from cart" });
    }
};

export const removeAllCart = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.cartItem = [];
        await user.save();

        return res.status(200).json({
            message: "Cart cleared successfully",
            cartItem: []
        });
    } catch (error) {
        console.error("Error from removeAllCart controller:", error);
        return res.status(500).json({ message: "Failed to clear cart" });
    }
};

export const updateProductQuantity = async (req, res) => {
    try {
        const productId = req.params.id;
        const { operation } = req.body;
        const userId = req.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const item = user.cartItem.find(
            (item) => item.product && item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: "Product not in cart" });
        }

        if (operation === 'increase') {
            item.quantity += 1;
        } else if (operation === 'decrease') {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                user.cartItem = user.cartItem.filter(
                    (p) => p.product && p.product.toString() !== productId
                );
            }
        } else {
            return res.status(400).json({
                message: "Invalid operation. Use 'increase' or 'decrease'."
            });
        }

        await user.save();

        return res.status(200).json({
            message: `Product quantity updated successfully`,
            cartItem: user.cartItem
        });
    } catch (error) {
        console.error("Error from updateProductQuantity controller:", error);
        return res.status(500).json({ message: "Failed to update quantity" });
    }
};
