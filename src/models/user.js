const mongoose=require("mongoose");

const userSchema= new mongoose.Schema({
    firstName:{
        required: true,
        minlength: 3,
        maxlength: 50,
        type: String,
    },
    lastName:{
        minlength: 3,
        maxlength: 50,
        type: String,
    },
    age:{
        min:18,
        max:50,
        type: Number,
    },
    emailId:{
        required: true,
        type:String,
        trim: true,
        unique: true,
        lowercase : true,
    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender data given is not valid ")
            }
        }
    },
    password:{
        required: true,
        type: String,
    },
    photourl:{
        type: String,
        default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP4iKihS75MSXBFERMe23vTk-UbwWMZ8cAtQ&s",
    },
    about:{
        type: String,
        default:"This is the default information about the user ",
    },
    skills:{
        type: [String],
    },
},{
    timestamps: true,
});
const User=mongoose.model("User",userSchema)
module.exports=User