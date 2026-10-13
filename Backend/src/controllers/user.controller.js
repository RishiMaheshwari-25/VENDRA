import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import {config} from "../config/config.js"

export async function sendTokenResponse(user,res){
    const token=await jwt.sign({
        id:user._id,
        email:user.email
    },config.JWT_SECRET)
}
export async function registerController(req,res){
    const {fullname,email,password,contact}=req.body;
    try{
        const existingUser=await userModel.findOne({
            $or:[
                {email},{contact}
            ]
        })
        if(!existingUser){
            res.status(404).json({
                message:"User with this email or contact already exists"
            })
        }
        const user=await userModel.create({fullname,email,contact,password})

    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Server error"
        })
    }
   
    

}
