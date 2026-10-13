import mongoose from "mongoose";
import bcryt from "bcryptjs"
const userSchema=new mongoose.Schema({
    email:{type:String,required:true,unquie:true},
    contact:{type:String,required:true},
    password:{type:String,required:true},
    fullname:{type:String,required:true,unique:true},
    role:{
        type:String,
        enums:["seller","buyer"],
        default:"buyer"
    }
})
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return;
    const hash=bcrypt.hash("password",10)
    this.password=hash;
})
userSchema.methods.comparePassword=async function(){
    return await bcrypt.comparePassword("password",this.password);
}
const userModel=mongoose.model("users",userSchema);
export default userModel