import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const userSchema=new mongoose.Schema({
    email:{type:String,required:true,unque:true},
    contact:{type:String,required:false},
    password:{type:String,
        required:function(){
            return !this.googleId
        }},
    fullname:{type:String,required:true,unique:true},
    role:{
        type:String,
        enum:["seller","buyer"],
        default:"buyer"
    },
    googleId:{
        type:String,
        required:false
    }
})
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const userModel=mongoose.model("users",userSchema);
export default userModel