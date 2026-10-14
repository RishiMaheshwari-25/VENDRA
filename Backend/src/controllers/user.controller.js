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
            role:user.role
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
        if(existingUser){
            res.status(404).json({
                message:"User with this email or contact already exists"
            })
        }
        const user=await userModel.create({fullname,email,contact,password,role:isSeller? "seller":"buyer"})
        await sendTokenResponse(user,res,"User Register Successfully")

    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Server error"
        })
    }
   
    

}
export async function loginController(req,res){
    
        const {email,password}=req.body;
        const user=await userModel.findOne({email});
        if(!user){
            res.status(400).json({
                message:"Invalid email or password"
            })
        }
        const isMatch=await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({
                message:"Invalid password"
            })
        }
        await sendTokenResponse(user,res,"User LoggedIn Succesfully")

    }
export async function googleCallback(req,res){
    console.log(req.user);
    res.redirect("http://localhost:5173/")
}
