import productModel from "../models/product.model.js"
import { uploadFile } from "../services/storage.service.js";

export async function createproduct(req,res){
    const {title,description,priceAmount,priceCurrency}=req.body;
    const seller=req.user
    const images=await Promise.all(req.files.map(async(file)=>{
        return await uploadFile({
            buffer:file.buffer,
            fileName:file.originalname
        })
    }))
    const product=await productModel.create({
        title,
        description,
        price:{
            amount:priceAmount,
            currency:priceCurrency || "INR"
        },
        images,
        seller:seller._id
    })
    res.status(201).json({
        message:"Product Created Successfully",
        success:true,
        product
    })
}
export async function getSellerProducts(req,res){
    const seller=req.user;
    const products=await productModel.find({seller:seller._id})
    res.status(200).json({
        message:"Products fetched Successfully",
        success:true,
        products
    })
}
export async function getAllProducts(req,res){
   const products=await productModel.find();
   res.status(200).json({
    message:"Products fetched successfully",
    success:true,
    products
   })
}
export async function getProductDetails(req,res){
      const {productId}=req.params;
      const product=await productModel.findById(productId);
      if(!product){
        return res.status(401).json({
            message:"Product is not found",
            success:false
        })
      }
      res.status(200).json({
        message:"Product details fetched successfully",
        success:true,
        product:{
            title:product.title,
            description:product.description,
            price:product.price,
            images:product.images
        }
      })

}