import mongoose from "mongoose";
import { ENV } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import { Order } from "../model/order.model.js";
import { User } from "../model/user.model.js";

const checkDbConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            message: "Database connection in progress. Please ensure MongoDB Atlas has whitelisted your IP address and retry."
        });
        return false;
    }
    return true;
};

export const createCheckoutSession = async (req, res) => {
    try {
        if (!checkDbConnection(res)) return;
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
                userId: req.id ? req.id.toString() : '',
                products: JSON.stringify(
                    products.map((p) => ({
                        id: (p.product?._id || p.product?.id || '').toString(),
                        name: p.product?.name || 'Product',
                        image: p.product?.image || '',
                        quantity: Number(p.quantity) || 1,
                        price: Number(p.product?.price) || 0
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
        if (!checkDbConnection(res)) return;
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                message: "SessionId is required"
            });
        }

        // 1. Idempotency: check if order was already recorded
        const existingOrder = await Order.findOne({ stripeSessionId: sessionId }).populate('products.product');
        if (existingOrder) {
            return res.status(200).json({
                message: "Order already confirmed",
                order: existingOrder
            });
        }

        // 2. Retrieve session from Stripe with 10s timeout
        const retrievePromise = stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items']
        });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Stripe session retrieval timed out")), 10000)
        );

        let session;
        try {
            session = await Promise.race([retrievePromise, timeoutPromise]);
        } catch (stripeErr) {
            console.error("Stripe session retrieve error:", stripeErr?.message || stripeErr);
            // Double check if created in the meantime
            const retryOrder = await Order.findOne({ stripeSessionId: sessionId }).populate('products.product');
            if (retryOrder) {
                return res.status(200).json({
                    message: "Order already confirmed",
                    order: retryOrder
                });
            }
            return res.status(500).json({
                message: "Unable to verify payment with Stripe at this moment. Please retry."
            });
        }

        if (session.payment_status === 'paid' || session.status === 'complete') {
            const rawProducts = JSON.parse(session.metadata?.products || '[]');
            let validProducts = rawProducts
                .filter(p => p && (p.id ? mongoose.Types.ObjectId.isValid(p.id) : true))
                .map((product) => ({
                    product: product.id && mongoose.Types.ObjectId.isValid(product.id) ? product.id : undefined,
                    name: product.name || 'Product',
                    image: product.image || '',
                    quantity: Number(product.quantity) || 1,
                    price: Number(product.price) || 0
                }));

            // Fallback to line_items from Stripe if metadata had no products
            if (validProducts.length === 0 && session.line_items?.data?.length > 0) {
                validProducts = session.line_items.data.map(item => ({
                    name: item.description || 'Product',
                    quantity: item.quantity || 1,
                    price: (item.amount_total || 0) / 100 / (item.quantity || 1)
                }));
            }

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
                try {
                    await User.findByIdAndUpdate(validUserId, {
                        $set: { cartItem: [] }
                    });
                } catch (cartErr) {
                    console.error("Failed to clear cart:", cartErr);
                }
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
