import mongoose from "mongoose";
import wishlistModel from "../models/wishlist.model.js";
import productModel from "../models/product.model.js";

// GET /api/wishlist -> saved products (full documents), most recently saved first
export async function getWishlist(req, res) {
    const wishlist = await wishlistModel.findOne({ user: req.user._id }).populate("products");
    // populate() drops products that have since been deleted
    const products = wishlist ? [...wishlist.products].reverse() : [];
    return res.status(200).json({
        message: "Wishlist fetched successfully",
        success: true,
        products
    });
}

// POST /api/wishlist/:productId
export async function addToWishlist(req, res) {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "Invalid product id", success: false });
    }
    const exists = await productModel.exists({ _id: productId });
    if (!exists) {
        return res.status(404).json({ message: "Product not found", success: false });
    }
    await wishlistModel.findOneAndUpdate(
        { user: req.user._id },
        { $addToSet: { products: productId } },
        { upsert: true, new: true }
    );
    return res.status(200).json({ message: "Added to wishlist", success: true });
}

// DELETE /api/wishlist/:productId
export async function removeFromWishlist(req, res) {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "Invalid product id", success: false });
    }
    await wishlistModel.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { products: productId } }
    );
    return res.status(200).json({ message: "Removed from wishlist", success: true });
}
