const mongoose=require("mongoose");
const validator=require("validator")

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
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email address")
            }
        }
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
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("password is not strong")
            }
        }
    },
    photourl:{
        type: String,
        default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP4iKihS75MSXBFERMe23vTk-UbwWMZ8cAtQ&s",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid photo url")
            }
        }
    },
    about:{
        type: String,
        default:"This is the default information about the user ",
    },
    skills:{
        type: [String],
        validate(value){
            if(value.length>10){
                throw new Error("The number of skills must not exceed 10");
            }
        }
    },
},{
    timestamps: true,
});
const User=mongoose.model("User",userSchema)
module.exports=User