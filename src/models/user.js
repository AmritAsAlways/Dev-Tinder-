const mongoose = require('mongoose');
const validator=require('validator');
//to check whether the password given by user is strong or not or the email,photourl given by user is
//valid or not to check all this we use a npm library named validtor 

//to know how to use validator just go to validator documentation 

//to control what is getting inside the usershema and to make the fields necessary to fill and unique
//mongoose provides us various schema types we have to use them like required , unique we can learn about 
//them from the mongoose documentation schematypes

const userSchema = new mongoose.Schema({ // but all these validation will only work when a new user is created 
    //not when a existing user is updated to run the validation even in the existing user updates in the update api
    //make runvalidtors option true
    firstName:{
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    lastName:{
        type: String,
        maxLength: 100,
    },
    emailId:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        //write the logic to validate inside the validate function give by mongoose
        validate(value){
            if(!validator.isEmail(value)) throw new Error("Enter a valid email "+value);
        },
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)) throw new Error("Enter a strong password "+value); 
        },
    },
    age:{
        type: Number,
        min: 18,
    },
    gender:{
        type: String,
        validate(value){ //any logic and be written inside this validate function and read about it from mongoose docum.
            if(!["male","female","others"].includes(value.toLowerCase())) throw new Error("Gender data is not valid"); 
        },
    },
    photoURL:{
        type: String,
        default: "https://i.pinimg.com/originals/15/0f/a8/150fa8800b0a0d5633abc1d1c4db3d87.jpg?nii=t",
        validate(value){
            if(!validator.isURL(value)) throw new Error("Enter a valid URL "+value); 
        },
    },
    about:{
        type: String,
        default: "This is the default description",
    },
    skills:{
        type: [String],
    },
},{
    timestamps:true, //if we want the time that at what time the user is registered so to get this
    //mongoose gives us a feature of timestamps 
});

const User = mongoose.model("User",userSchema); // this is a user model it contain the schema that what information the user 
//should have 

module.exports = User;