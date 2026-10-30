import mongoose from "mongoose";
import { ENV } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import { Order } from "../model/order.model.js";
import { User } from "../model/user.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                message: "No products provided for checkout"
            });
        }

        let totalAmount = 0;

        const lineItems = products.map((item) => {
            const product = item.product || {};
            const price = Number(product.price || 0);
            const quantity = Number(item.quantity || 1);
            const amountInCents = Math.round(price * 100);
            totalAmount += amountInCents * quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name || "Product",
                        images: product.image ? [product.image] : []
                    },
                    unit_amount: amountInCents
                },
                quantity
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${ENV.CLIENT_URL}/purchase?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${ENV.CLIENT_URL}/cart`,
            metadata: {
                userId: req.id.toString(),
                products: JSON.stringify(
                    products.map((p) => ({
                        id: (p.product?._id || p.product?.id || '').toString(),
                        quantity: p.quantity,
                        price: p.product?.price
                    }))
                )
            }
        });

        return res.status(200).json({
            id: session.id,
            totalAmount: totalAmount / 100,
            url: session.url
        });
    } catch (error) {
        console.error("Error from createCheckoutSession controller:", error);
        return res.status(500).json({ message: "Failed to create checkout session" });
    }
};

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                message: "SessionId is required"
            });
        }

        // Idempotency: check if order was already recorded
        const existingOrder = await Order.findOne({ stripeSessionId: sessionId }).populate('products.product');
        if (existingOrder) {
            return res.status(200).json({
                message: "Order already confirmed",
                order: existingOrder
            });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const rawProducts = JSON.parse(session.metadata?.products || '[]');
            const validProducts = rawProducts
                .filter(p => p && p.id && mongoose.Types.ObjectId.isValid(p.id))
                .map((product) => ({
                    product: product.id,
                    quantity: Number(product.quantity) || 1,
                    price: Number(product.price) || 0
                }));

            const userId = session.metadata?.userId;
            const validUserId = userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined;

            const newOrder = new Order({
                user: validUserId,
                products: validProducts,
                totalAmount: (session.amount_total || 0) / 100,
                stripeSessionId: sessionId
            });

            await newOrder.save();

            // Clear the user's cart
            if (validUserId) {
                await User.findByIdAndUpdate(validUserId, {
                    $set: { cartItem: [] }
                });
            }

            const populatedOrder = await Order.findById(newOrder._id).populate('products.product');

            return res.status(200).json({
                message: "Payment completed successfully",
                order: populatedOrder || newOrder
            });
        }

        return res.status(400).json({
            message: "Payment has not been completed"
        });
    } catch (error) {
        console.error("Error from checkoutSuccess controller:", error);
        return res.status(500).json({ message: "Failed to confirm payment" });
    }
};
