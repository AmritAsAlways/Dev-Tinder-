const mongoose = require('mongoose');
// import mongoose from "mongoose"; this is also correct

//this method is also correct 
// const { Schema } = mongoose; //it means we are creating a database schema here

// const User = new Schema{ //it means the name of the schema will be user and below are the required field's for it


// };

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
    },
    lastName:{
        type: String,
    },
    emailId:{
        type: String,
    },
    password:{
        type: String,
    },
    age:{
        type: Number,
    },
    gender:{
        type: String,
    },
});

const User = mongoose.model("User",userSchema); // this is a user model it contain the schema that what information the user 
//should have 

module.exports = User;