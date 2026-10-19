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
        product
      })

}
export async function createProductVariant(req,res){
    const productId=req.params.productId;

    const product=await productModel.findOne({
        _id:productId,
        seller:req.user._id
    });
    if(!product){
        return res.status(401).json({
            message:"Product not found",
            success:false
        })
    }
    
    const files =req.files;
    const images=[];
    if(files || files.length!==0){
        (await Promise.all(files.map(async(file)=>{
            const image=await uploadFile({
                buffer:file.buffer,
                fileName:file.originalname
            })
            return image;
        }))).map(image=>images.push(image))
    }
    const price=req.body.priceAmount
    const stock=req.body.stock
    const attributes=JSON.parse(req.body.attributes || "{}")
    product.variants.push({
        images,
        price:{
            amount:Number(price) || product.price.amount,
            currency:req.body.priceCurrency || product.price.currency
        },
        stock,
        attributes

    })
    await product.save()
    res.status(200).json({
        message:"Product Variants add successfully",
        success:true,
        product
    })
    
}