import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    owner:{
        type:Boolean,
        default:false
    },
    profilePhoto:{
        type:String
    },


    cartItem:[
        {
            quantity:{
                type:Number,
                default:1
            },
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            }
        }
    ]
},{timestamps:true})

export const User = mongoose.model("User", userSchema)
//ower is myself as i if i login with my wmail id then that is true else false
// ye is;iye kar rhe hai bcx fronted me jo v functionality hai wo sirf owener ko hi show hogi ok