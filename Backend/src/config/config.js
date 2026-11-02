import dotenv from "dotenv";
dotenv.config();
 if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it to your environment before starting the server.");
  }
  if(!process.env.JWT_SECRET){
    throw new Error("JWT Secret is not defined in the environment variable")
  }
  if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE Client Id is not defined in the environment variable")
  }
  if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE CLIENT SECRET is not defined in the environment variable")
  }
  if(!process.env.IMAGEKIT_PRIVATE_KEY){
    throw new Error("Image kit private key  is not defined in the environment variable")
  }
  if(!process.env.RAZORPAY_KEY_ID){
    throw new Error("Razorpay private key  is not defined in the environment variable")
  }
  if(!process.env.RAZORPAY_KEY_SECRET){
    throw new Error("Razorpay secret key  is not defined in the environment variable")
  }
  if(!process.env.REDIS_HOST){
    throw new Error("REDIS_HOST is not defined in the environment variable")
  }
  if(!process.env.REDIS_PORT){
    throw new Error("REDIS_PORT is not defined in the environment variable")
  }
  if(!process.env.REDIS_PASSWORD){
    throw new Error("REDIS_PASSWORD is not defined in the environment variable")
  }
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL is not defined in the environment variable")
}
if (isProduction && !process.env.GOOGLE_CALLBACK_URL) {
    throw new Error("GOOGLE_CALLBACK_URL is not defined in the environment variable")
}
export const config={
    FRONTEND_URL:(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, ""),
    GOOGLE_CALLBACK_URL:process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    REDIS_TLS:process.env.REDIS_TLS === "true",
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV:process.env.NODE_ENV,
    IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET,
  REDIS_HOST:process.env.REDIS_HOST,
  REDIS_PORT:process.env.REDIS_PORT,
  REDIS_PASSWORD:process.env.REDIS_PASSWORD
}