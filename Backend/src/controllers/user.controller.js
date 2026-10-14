import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import {config} from "../config/config.js"

export async function sendTokenResponse(user,res,message){
    const token= jwt.sign({
        id:user._id,
        email:user.email
    },config.JWT_SECRET,{expiresIn:"7d"})
    res.cookie("token",token);
    res.status(200).json({
        message,
        token,
        user:{
            id:user._id,
            email:user.email,
            contact:user.contact,
            role:isSeller?"seller":"buyer"
        }
    })

}
export async function registerController(req,res){
    const {fullname,email,password,contact,isSeller}=req.body;
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
        await sendTokenResponse(user,res,"User Register Successfully")

    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Server error"
        })
    }
   
    

}
