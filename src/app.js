const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const { validatesignupdata } = require("./utils/validators");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken"); //we use this create tokens
const { userAuth } = require("./middleware/auth");

app.post("/signup",async (req,res)=>{
  //we are creating a demo object 
  const userObject={
    firstName:"virat",
    lastName: "Tendulkar",
    emailId:"virat@gmail.com",
    password:"virat",
    age:"23",
    gender: "Male",
  }

  //now we will make a instance of this user object using the user model schema
  const user = new User(userObject);

  //we can do this like this also
  // const user = new User({
  //   firstName:"Amrit",
  //   lastName: "Raj",
  //   email:"amrit@gmail.com",
  //   password:"amrit",
  //   age:23,
  // });

  //and we will save this instance into the database
  await user.save() // this will save the userobject in the database and it is asynchronous so we will have to add async or await
  res.send("User Added successfully ");
})



connectDB()
  .then(() => {
    console.log("Database connection is established");
    app.listen(7777, () => {
      console.log("the server is listening on port 7777");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected");
  });
