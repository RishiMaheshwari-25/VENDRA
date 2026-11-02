import mongoose from "mongoose";
const blackListSchema=new mongoose.schema({
    token:{
        type:String,
        required:[true,"Token is required for blacklisting"],
    }

},
{
    timestamps:true
})
const blackListModel=mongoose.model("blacklist",blackListSchema);
export default blackListModel;