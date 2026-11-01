import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { getMyOrders, getOrderController } from "../controllers/order.controller.js";

const orderRouter = Router();
orderRouter.get("/", authenticateUser, getMyOrders);
orderRouter.get("/:orderId", authenticateUser, getOrderController);

export default orderRouter;
