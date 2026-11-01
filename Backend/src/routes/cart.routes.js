import Router from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validateAddToCart,validateIncrementCartItemQuantity } from "../validator/cart.validator.js";
import { addToCart, createOrderCart, decrementItemsByOne, getCart, incrementItemsByOne, verifyOrderController } from "../controllers/cart.controller.js";
const cartRouter=Router();
cartRouter.post("/add/:productId/:variantId",authenticateUser,validateAddToCart,addToCart)
cartRouter.get("/",authenticateUser,getCart);
cartRouter.patch("/quantity/increment/:productId/:variantId",authenticateUser,validateIncrementCartItemQuantity,incrementItemsByOne)
cartRouter.patch("/quantity/decrement/:productId/:variantId",authenticateUser,validateIncrementCartItemQuantity,decrementItemsByOne)
cartRouter.post("/payment/create/order",authenticateUser,createOrderCart)
cartRouter.post("/payment/verify/order",authenticateUser,verifyOrderController)
export default cartRouter;