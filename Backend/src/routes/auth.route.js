import {Router} from "express";
import { registerController,loginController, googleCallback } from "../controllers/user.controller.js";
import { validateRegisterUser,validateLoginUser } from "../validator/auth.validator.js";
import passport from "passport"
import { config } from "../config/config.js";
const authRouter=Router();
authRouter.post("/register",validateRegisterUser,registerController);
authRouter.post("/login",validateLoginUser,loginController)
authRouter.get("/google",
   passport.authenticate("google",{scope:["profile","email"]})
)
authRouter.get("/google/callback",
    passport.authenticate("google",{session:false,failureRedirect:config.NODE_ENV=="devlopment"?"http://localhost:5173/login":"/login"}),
googleCallback)

export default authRouter;