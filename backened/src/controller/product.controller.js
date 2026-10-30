import { GoogleGenerativeAI } from "@google/generative-ai";
import cloudinary from "../config/cloudinary.js";
import { redis } from "../config/redis.js";
import { Product } from "../model/product.model.js";
import { ENV } from "../config/env.js";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL || "gemini-2.0-flash-lite" });

const clearProductCache = async () => {
    try {
        const keys = await redis.keys("products:*");
        if (keys && keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (e) {
        console.warn("Failed to clear redis cache:", e?.message || e);
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({
                message: "Please provide all product details (name, description, price, category)"
            });
        }

        let imageUrl = '';
        if (req.file) {
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const uploadRes = await cloudinary.uploader.upload(base64, {
                folder: "Product"
            });
            imageUrl = uploadRes.secure_url;
        }

        const product = await Product.create({
            name: name.trim(),
            category: category.trim(),
            price: Number(price),
            description: description.trim(),
            image: imageUrl
        });

        await clearProductCache();

        return res.status(201).json(product);
    } catch (error) {
        console.error("Error from createProduct controller:", error);
        return res.status(500).json({ message: "Failed to create product" });
    }
};

export const getProductController = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
        const limit = Math.max(1, parseInt(req.query.limit ?? "20", 10));
        const skip = (page - 1) * limit;

        const { search, category, minPrice, maxPrice } = req.query;

        let aiText = "";
        if (search && search.trim() !== "") {
            const rawSearch = search.trim();
            try {
                const prompt = `You are an intelligent assistant for an E-commerce platform. A user will type any query about what they want. Your task is to understand the intent and return the most relevant keyword from the following list of categories:
- Jeans
- Pants
- Shirt
- Jacket
- Saree
- Shoes

Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text. Query: "${rawSearch}"`;

                const result = await model.generateContent(prompt);
                const generated = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/[`"\n]/g, "");
                aiText = generated || rawSearch;
            } catch (aiErr) {
                console.warn("Gemini intent extraction skipped, using direct query:", aiErr?.message || aiErr);
                aiText = rawSearch;
            }
        }

        const mongoQuery = {};

        if (aiText) {
            mongoQuery.$or = [
                { name: { $regex: aiText, $options: "i" } },
                { description: { $regex: aiText, $options: "i" } },
                { category: { $regex: aiText, $options: "i" } }
            ];
        }

        if (category && category.trim() !== "") {
            mongoQuery.category = category.trim();
        }

        if (minPrice || maxPrice) {
            mongoQuery.price = {};
            if (minPrice && !isNaN(Number(minPrice))) mongoQuery.price.$gte = Number(minPrice);
            if (maxPrice && !isNaN(Number(maxPrice))) mongoQuery.price.$lte = Number(maxPrice);
        }

        const cacheKey = `products:${JSON.stringify({
            page,
            limit,
            search: aiText || "",
            category: category || "",
            minPrice: minPrice || "",
            maxPrice: maxPrice || ""
        })}`;

        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
                return res.status(200).json({ fromCached: true, ...data });
            }
        } catch (cacheErr) {
            console.warn("Redis read error:", cacheErr?.message || cacheErr);
        }

        const [items, total] = await Promise.all([
            Product.find(mongoQuery).skip(skip).limit(limit).lean(),
            Product.countDocuments(mongoQuery)
        ]);

        const totalPages = Math.ceil(total / limit) || 1;
        const hasMore = page < totalPages;

        const payload = {
            products: items || [],
            page,
            limit,
            total,
            totalPages,
            hasMore,
            appliedFilters: {
                search: aiText,
                category: category || "",
                minPrice: minPrice || "",
                maxPrice: maxPrice || ""
            }
        };

        try {
            await redis.set(cacheKey, JSON.stringify(payload), { ex: 300 });
        } catch (cacheErr) {
            console.warn("Redis write error:", cacheErr?.message || cacheErr);
        }

        return res.status(200).json({ fromCached: false, ...payload });
    } catch (error) {
        console.error("Error from getProductController:", error);
        return res.status(500).json({ message: "Failed to fetch products" });
    }
};

export const getFeatureProduct = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        return res.status(200).json(featuredProducts || []);
    } catch (error) {
        console.error("Error from getFeatureProduct controller:", error);
        return res.status(500).json({ message: "Failed to fetch featured products" });
    }
};

export const toggleFeatureProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isFeatured = !product.isFeatured;
        await product.save();

        await clearProductCache();

        return res.status(200).json({
            message: "Product featured status toggled successfully",
            product
        });
    } catch (error) {
        console.error("Toggle featured error:", error);
        return res.status(500).json({ message: "Failed to toggle product status" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.image && product.image.includes("cloudinary.com")) {
            const parts = product.image.split("/");
            const filename = parts.pop();
            const publicId = filename.split(".")[0];
            try {
                await cloudinary.uploader.destroy(`Product/${publicId}`);
            } catch (cloudinaryErr) {
                console.warn("Error deleting image from Cloudinary:", cloudinaryErr?.message || cloudinaryErr);
            }
        }

        await Product.findByIdAndDelete(productId);
        await clearProductCache();

        return res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error from deleteProduct controller:", error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
};

export const getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error("Error from getSingleProduct controller:", error);
        return res.status(500).json({ message: "Failed to fetch product details" });
    }
};
