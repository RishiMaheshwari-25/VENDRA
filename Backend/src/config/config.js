import dotenv from "dotenv";
dotenv.config();
 if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it to your environment before starting the server.");
  }
  if(!process.env.JWT_SECRET){
    throw new Error("JWT Secret is not defined in the environment variable")
  }
export const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET
}