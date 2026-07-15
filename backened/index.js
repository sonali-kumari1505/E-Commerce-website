import express from "express";
import { ENV } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
import userRoute from "./src/routes/user.route.js";
import productRoute from "./src/routes/product.route.js";
// import cartRoute from "./src/routes/cart.route.js";
// import paymentRoute from "./src/routes/payment.route.js";
// import analyticRoyte from "./src/routes/analytic.route.js";
// import cors from 'cors'
const app = express()


// app.use(cors({
//     origin:'http://localhost:5173',
//     credentials:true
// }))
app.use(cookieParser())
// express read cookies easily
app.use(express.json())
// This middleware converts JSON request bodies into JavaScript objects.
app.use(express.urlencoded({extended:true}))
// parses html form data and extended true means it parse the nexted form data

app.use('/api', userRoute)
app.use('/api/product', productRoute)
// app.use('/api/cart', cartRoute)
// app.use('/api/payment', paymentRoute)
// app.use('/api/analytic', analyticRoyte)
const startServer = async () => {
    try {
    
        await connectDB();
 
        app.listen(ENV.PORT, () => {
            console.log(`Server started on ${ENV.PORT}`);
        });
    } catch (error) {
        console.log("Failed to connect to database:", error);
    }
};

startServer();