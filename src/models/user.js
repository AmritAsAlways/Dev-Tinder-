const mongoose=require("mongoose");

const userSchema= new mongoose.Schema({
    firstName:{
        type: String,
    },
    lastName:{
        type: String,
    },
    age:{
        type:Number,
    },
    emailId:{
        type:String,
    },
    gender:{
        type:String,
    },
    password:{
        type:String,
    },
});
const User=mongoose.model("User",userSchema)
module.exports=User