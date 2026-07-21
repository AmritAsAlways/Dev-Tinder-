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
//the json data which comes from the enduser is converting into javascript object to save the object in database
//and it converts all json requets from enduser to javascript objects
//now this middleware will work for all the routes

app.post("/signup", async (req, res) => {
  //now as we are sending the data from the postman so to get the data as the data
  //comes in the req  part then to get data we will use req.body as body will contain
  //the json data but to get the json data we will have to use a middleware which converts
  // the json data to javascipt object and we can use it and the middleware used here
  //is the express.json()

  const userobject = req.body;
  //now what we are doing is that we making the /signup api more secure to make it more secure 
  //it means we donot trust the user's input given to us and one more problem is that in the database
  //the password is stored as normal password but we want to save the encrypted form of the password in the database
  //so do all this we first validate the data given by user

  //write all this logic inside the try catch block
  try {
    validatesignupdata(req); //we are giving the entire request to this is validate function

    //after the data is validated then we will encrypt the password to encrypt the password we use a builtin tool called bycrypt
    //encrypting a password 
    const {firstName,lastName,emailId,password}=req.body; //extracting all the required fields earlier
    const passwordHash=await bcrypt.hash(password,10); //it returns a promise how this function works learn from documentation 
    console.log(passwordHash);

    //creating an instance of the model/user schema
    // const user = new User(userobject); this is not a proper way to create a instance of the userobject to make it properly extract all the fields earlier from the userobject
    //which we have already done
    const user=new User({
      firstName,
      lastName,
      emailId,
      password:passwordHash,
    });

    await user.save(); //method used to save data to database
    res.send("Data added to Database successfully");
  } catch (err) {
    res.status(400).send("some error occured " + err.message);
  }
});

app.post("/login",async (req,res)=>{
  try{
    //receive the user info
  const {emailId,password}=req.body; //we extracted all the essential information fron the externaluser

  //validate whether the emailId given is a genuine emailId
  if(!validator.isEmail(emailId)) throw new Error("Enter a valid emailId");

  //how to find that same data in database using userId 
  const userobject=await User.findOne({emailId:emailId});
  if(!userobject) throw new Error("user not in database signup first");

  //check if the emailId is correct
  let passwordcompare=bcrypt.compare(password,userobject.password);
  if(!passwordcompare) throw new Error("wrong password");
  res.send("login successful");
  }
  catch(err){
    res.status(400).send("something went wrong "+err.message);
  }
});

//how to get a user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId; // get the emailId from the request that the end user is giving us

  try {
    const user = await User.find({ emailId: userEmail }); //how to find a user from the database using some parameters
    //get to this we will use the mongoose documentation model part the go this function and read about it
    // here we first use the name of the model from which we want the data to come this will return all the user objects which
    // matches the criteria and if we use .findOne() we will get only one object

    //but if the length of the user object is [] or 0 means there is no user present with this emailId
    if (user.length === 0) res.send("No such User is present ");
    res.send(user);
  } catch (err) {
    res.status(400).send("User not found ");
  }
});

//how to get all the data from the database
app.get("/feed", async (req, res) => {
  try {
    const alldata = await User.find({});
    res.send(alldata);
  } catch (err) {
    res.status(400).send("some error occured ");
  }
});

//how to delete data from the database
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;

  try {
    const ispresent = await User.findByIdAndDelete(userId); //learn about the method's from the
    //mongoose documentation
    if (!ispresent) res.send("user was not present in database");
    res.send("user deleted succesfully");
  } catch (err) {
    res.status(400).send("something went wrong");
  }
});

//how to update a user data
app.patch("/user/:userId", async (req, res) => {
  // const userId = req.body.userId;
  const userId = req.params?.userId;
  const userobject = req.body;

  //now one of the problem here is that here the end user through postman or some can give a lot of
  //unwanted field's in the data model like "xyx": "abc" but these field are not present in the user shema
  //and also in patch api here the end user can also update it's email which we don't want to have
  //so what we will do it that whenever we get the userobject means all the things the user wants us to update
  //we will only update a selective things here

  //we should write all the logic inside try catch block

  try {
    // await User.findByIdAndUpdate(userId,userobject); // read about this method from mongoose models
    // //read and try the options parameter in this method and see what happens
    // //in this userobjects if we put some unnessary fields which are not prenset in the user model
    // //schema then this method donot update that fields only those fields are changed which are present in the
    // //model schema

    // others parameters that can be entered here is runValidators means if a user object is being
    //changed then the userobject will be again validated with User model provided
    // means validator function will run even when we update the userobject
    // await User.findByIdAndUpdate(userId,userobject,runValidtors=true);  wrong way

    // const ALLOWED_UPDATES = ["userId", "photoURL", "about", "skills", "age"]; //here we are using userId as a field here so it means
    //this can also be updated but we dont want that so
    const ALLOWED_UPDATES = ["photoURL", "about", "skills", "age"]; //so we made this
    //and we will get the userId from the route it self
    //we will change the route from /user to /user/:userId and will also change the userId variable

    const isUpdatesAllowed = Object.keys(userobject).every((k) =>
      ALLOWED_UPDATES.includes(k),
    );

    if (!isUpdatesAllowed) {
      throw new Error("updates not allowed ");
    }

    //check for if the skills length is <=10
    // Check skills only if skills is present in the request
    if (userobject.skills?.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }

    await User.findByIdAndUpdate(userId, userobject, { runValidators: true });

    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("something went wrong"+err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection is established");
    app.listen(7777, () => {
      console.log("the server is listening on port 7777");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected" + err.message);
  });
