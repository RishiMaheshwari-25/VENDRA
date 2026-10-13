import {Router} from "express";
import { registerController } from "../controllers/user.controller.js";
import { validateRegisterUser } from "../validator/auth.validator.js";
const authRouter=Router();
authRouter.post("/register",validateRegisterUser,registerController)


export default authRouter;