import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
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
    ],

    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordExpires: {
        type: Date,
        default: null
    }
},{timestamps:true})

export const User = mongoose.model("User", userSchema)
