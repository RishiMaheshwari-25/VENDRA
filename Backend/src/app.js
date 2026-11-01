import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import { config } from "./config/config.js";
import productRouter from "./routes/product.route.js"
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";

const app = express();
// app.use(cors({
//     origin:"http://localhost:5173",
//     methods:['Get','POST','PUT','DELETE'],
//     credentials:true
// }))
app.use(passport.initialize());
passport.use(new GoogleStrategy({
    clientID:config.GOOGLE_CLIENT_ID,
    clientSecret:config.GOOGLE_CLIENT_SECRET,
    callbackURL:"/api/auth/google/callback"
},(accesToken,refreshToken,profile,done)=>{
    return done(null,profile);
}))
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser())
app.use("/api/auth",authRouter);
app.use("/api/products",productRouter);
app.use("/api/cart",cartRouter)
app.use("/api/orders",orderRouter)
app.use("/api/wishlist",wishlistRouter)

export default app;