import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    products:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            name:{
                type:String,
                default:''
            },
            image:{
                type:String,
                default:''
            },
            quantity:{
                type:Number,
                required:true,
                min:1
            },
            price:{
                type:Number,
                required:true,
                min:0
            }
        }
    ],

    totalAmount:{
        type:Number,
        required:true,
        min:0
    },

    stripeSessionId:{
        type:String,
        unique:true,
        sparse:true
    }
},{timestamps:true})

export const Order = mongoose.model("Order", orderSchema)
