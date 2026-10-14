import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express();
app.use(cors({
    origin:"http://localhost:5173",
    methods:['Get','POST','PUT','DELETE'],
    credentials:true
}))
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser())
app.use("/api/auth",authRouter);

export default app;