import {Router} from "express";
import { registerController,loginController, googleCallback, getMeController,logoutController } from "../controllers/user.controller.js";
import { validateRegisterUser,validateLoginUser } from "../validator/auth.validator.js";
import passport from "passport"
import { config } from "../config/config.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
const authRouter=Router();
authRouter.post("/register",validateRegisterUser,registerController);
authRouter.post("/login",validateLoginUser,loginController)
authRouter.get("/get-me",authenticateUser,getMeController);
authRouter.get("/google",
   passport.authenticate("google",{scope:["profile","email"]})
)
authRouter.get("/google/callback",
    passport.authenticate("google",{session:false,failureRedirect:`${config.FRONTEND_URL}/login`}),
googleCallback)
authRouter.get("/logout",logoutController)

export default authRouter;