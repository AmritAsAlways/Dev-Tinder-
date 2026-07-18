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

app.use(express.json()); // this is a middleware given by the express to convert any json data to 
//javascript object and we can use it then 
//now this middleware will work for all the routes


app.post("/signup", async (req, res) => {
  //now as we are sending the data from the postman so to get the data as the data 
  //comes in the req  part then to get data we will use req.body as body will contain 
  //the json data but to get the json data we will have to use a middleware which converts 
  // the json data to javascipt object and we can use it and the middleware used here 
  //is the express.json()

  const userobject = req.body;
  //creating an instance of the model/user schema 
  const user = new User(userobject);

  try{
    await user.save(); //method used to save data to database
    res.send("Data added to Database successfully");
  }
  catch(err){
    res.status(400).send("some error occured "+ err.message);
  }
});

//how to get a user by email
app.get("/user",async (req,res)=>{
  const userEmail=req.body.emailId; // get the emailId from the request that the end user is giving us
  
  try{
    const user=await User.find({emailId : userEmail}); //how to find a user from the database using some parameters
    //get to this we will use the mongoose documentation model part the go this function and read about it
    // here we first use the name of the model from which we want the data to come this will return all the user objects which 
    // matches the criteria and if we use .findOne() we will get only one object

    //but if the length of the user object is [] or 0 means there is no user present with this emailId
    if(user.length===0) res.send("No such User is present ");
    res.send(user);
  }
  catch(err){
    res.status(400).send("User not found ");
  }
})


//how to get all the data from the database
app.get("/feed",async (req,res)=>{
  try{
    const alldata=await User.find({});
    res.send(alldata);
  }
  catch(err){
    res.status(400).send("some error occured ");
  }
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
