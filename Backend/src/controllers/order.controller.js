import mongoose from "mongoose";
import paymentModel from "../models/payment.model.js";
import productModel from "../models/product.model.js";

// Shapes a payment document into the order the frontend renders.
// Variant attributes (size, colour...) are looked up from the product because
// orderItems only stores the variant id.
async function toOrderDto(payments) {
    const productIds = [...new Set(payments.flatMap(p => p.orderItems.map(i => String(i.productId))))];
    const products = await productModel.find({ _id: { $in: productIds } }).select("variants._id variants.attributes");
    const attributesByVariant = new Map();
    products.forEach(product => {
        product.variants.forEach(variant => {
            attributesByVariant.set(String(variant._id), variant.attributes ? Object.fromEntries(variant.attributes) : {});
        });
    });

    return payments.map(payment => ({
        id: payment._id,
        orderId: payment.razorpay?.orderId,
        paymentId: payment.razorpay?.paymentId || null,
        status: payment.status,
        amount: payment.price.amount,
        currency: payment.price.currency,
        // Orders created before timestamps were added fall back to the time embedded in the id.
        createdAt: payment.createdAt || payment._id.getTimestamp(),
        paidAt: payment.status === "paid" ? (payment.updatedAt || payment.createdAt || payment._id.getTimestamp()) : null,
        items: payment.orderItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            image: item.images?.[0]?.url || null,
            attributes: attributesByVariant.get(String(item.variantId)) || {},
            quantity: item.quantity,
            unitPrice: item.price?.amount,
            currency: item.price?.currency || payment.price.currency
        }))
    }));
}

// GET /api/orders  -> the signed-in user's paid orders, newest first
export async function getMyOrders(req, res) {
    const payments = await paymentModel
        .find({ user: req.user._id, status: "paid" })
        .sort({ _id: -1 })
        .limit(100);
    const orders = await toOrderDto(payments);
    return res.status(200).json({
        message: "Orders fetched successfully",
        success: true,
        orders
    });
}

// GET /api/orders/:orderId  (also mounted at /api/cart/payment/order/:orderId)
// orderId may be the Razorpay order id or the document id. Always scoped to the signed-in user.
export async function getOrderController(req, res) {
    const { orderId } = req.params;
    const match = [{ "razorpay.orderId": orderId }];
    if (mongoose.isValidObjectId(orderId)) match.push({ _id: orderId });

    const payment = await paymentModel.findOne({ user: req.user._id, $or: match });
    if (!payment) {
        return res.status(404).json({
            message: "Order not found",
            success: false
        });
    }
    const [order] = await toOrderDto([payment]);
    return res.status(200).json({
        message: "Order fetched successfully",
        success: true,
        order
    });
}
