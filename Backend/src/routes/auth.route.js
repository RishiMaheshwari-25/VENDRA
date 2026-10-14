import {Router} from "express";
import { registerController,loginController } from "../controllers/user.controller.js";
import { validateRegisterUser,validateLoginUser } from "../validator/auth.validator.js";
const authRouter=Router();
authRouter.post("/register",validateRegisterUser,registerController);
authRouter.post("/login",validateLoginUser,loginController)


export default authRouter;