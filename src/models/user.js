const mongoose = require('mongoose');

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