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
export const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV:process.env.NODE_ENV
}