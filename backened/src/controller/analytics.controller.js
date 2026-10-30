import { Order } from "../model/order.model.js";
import { Product } from "../model/product.model.js";
import { User } from "../model/user.model.js";

export const getData = async () => {
    const totalUser = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            }
        }
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users: totalUser,
        products: totalProducts,
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
};

export const getAnalyticsController = async (req, res) => {
    try {
        const data = await getData();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error from getAnalyticsController:", error);
        return res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
};

function getDatesInRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const stopDate = new Date(endDate);

    while (currentDate <= stopDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

export const getDailySalesData = async (startDate, endDate) => {
    const dailySales = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
        const found = dailySales.find((item) => item._id === date);
        return {
            date,
            sales: found?.sales || 0,
            revenue: Math.round((found?.revenue || 0) * 100) / 100
        };
    });
};

export const getDailySalesController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "Please provide both startDate and endDate query parameters"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format provided" });
        }

        // Include the entire end day
        end.setHours(23, 59, 59, 999);

        const data = await getDailySalesData(start, end);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error from getDailySalesController:", error);
        return res.status(500).json({ message: "Failed to fetch daily sales data" });
    }
};
