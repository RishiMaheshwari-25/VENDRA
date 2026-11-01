import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";

const wishlistRouter = Router();
wishlistRouter.get("/", authenticateUser, getWishlist);
wishlistRouter.post("/:productId", authenticateUser, addToWishlist);
wishlistRouter.delete("/:productId", authenticateUser, removeFromWishlist);

export default wishlistRouter;
