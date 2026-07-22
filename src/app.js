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

//what is the authentication and jwt token and a cookie.in an actual application we donot want any unautherized user to access
//any of the routes of our application without logining in or without signing up so to takel this problem
// token is created means when we login in into any application it generate's a jwt token which only made for that user only that is unique
// and what the application does is that it returns that jwt token inside a cookie and give it back to the user
//now all the browser what they does is that they store that cookie given by the application and whenever the user requets to access any other routes
//of the application then browser send's this cookie back to the application then application validate's this cookie send by user to check if it genuinely that user
//and then the application let the user access that particular route

//now when application send's the user it can also a timer inside the cookie that after sometime be it 1day, 1 month ,1 year or lifetime the cookie will expire after that time
//and user will have to again log in into the application

//now we cannot directly access the cookie send by the user and stored in the browser to access that cookie we have first parce that cookie and then only we can access it
//to do this we use a cookieparser() library to parse every cookie send by the application so we will use it
//like a middleware
//now it will parse everycookie before using any routes

//and to create a jwt token we use a library known as jsonwebtoken and it has various method
//and there it has 2 methods one to create a token and other to validate the token
app.use(cookieParser());

//now we have to do authentication for every route other than the /login and the /signup route so 
//to do this we will make a  route in another file and pass this route as a middleware in all those route we want to add authentication

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
    const { firstName, lastName, emailId, password } = req.body; //extracting all the required fields earlier
    const passwordHash = await bcrypt.hash(password, 10); //it returns a promise how this function works learn from documentation
    console.log(passwordHash);

    //creating an instance of the model/user schema
    // const user = new User(userobject); this is not a proper way to create a instance of the userobject to make it properly extract all the fields earlier from the userobject
    //which we have already done
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save(); //method used to save data to database
    res.send("Data added to Database successfully");
  } catch (err) {
    res.status(400).send("some error occured " + err.message);
  }
});

//create a jwt token and cookie and give it back to the user after you have checked the user is valid i.e user has logged in
app.post("/login", async (req, res) => {
  try {
    //receive the user info
    const { emailId, password } = req.body; //we extracted all the essential information fron the externaluser

    //validate whether the emailId given is a genuine emailId
    if (!validator.isEmail(emailId)) throw new Error("Enter a valid emailId");

    //how to find that same data in database using userId
    const userobject = await User.findOne({ emailId: emailId });
    if (!userobject) throw new Error("user not in database signup first");

    //to use the validatepassword we have to first use the userobject or the user model object we have got as this object has the validatepassword function
    const passwordcompare = await userobject.validatePassword(password); 
    if (!passwordcompare) throw new Error("wrong password");

    //creating a jwt token
    //using the jsonwebtoken to create token it takes 2 inputs one the message we want to encrypt and a securitykey given by us
    //as we want to create a unique token for every user so just use the mongodb id here

    //now how to get token here for this mongoose has given us a special methods called getJWT() 

    //to use the getJWT() we have to first use the userobject or the user model object we have got as this object has the getJWT() function
    const jwttokenhaibhai= await userobject.getJWT(); //it will give us the token made specificly for that user in the user model schema
    //this just makes our code more readable 

    //we can also send the time when after which the jwttoken will expire like this
    // const token = await jwt.sign({_id:userobject._id},"fagaega",{expiresIn:'1h'}); here 1h means 1h 0h means 0 hour and 7d means 7 days and so on

    console.log(jwttokenhaibhai);
    console.log(userobject._id);
    //create a cookie and put the token inside the cookie -> to create a cookie we use a inbuilt method given to us by the express
    //i.e res.cookie(Name,value) it generates a cookie  with the name of Name and it contains a token called value here
    res.cookie("tokenwallacookie", jwttokenhaibhai); // this is a random token generated by me
    //and this cookie we will get to see in the browser or postman just where you give the response we can see there is a cookie button
    //from there we can access the cookie

    //we can also expire the cookie like this also 
    // res.cookie("tokenwallacookie", jwttokenhaibhai,{expires: new Date(Date.now() + 24 * 60 * 60 * 1000)}); this means the cookie expires in 1day
    //as 24 * 60 * 60 * 1000 // 1 day in milliseconds
    
    res.send("login successful");
  } catch (err) {
    res.status(400).send("something went wrong " + err.message);
  }
});

//now we will create a api for /profile to check the logic of cookie and token
app.get("/profile",userAuth,async (req, res) => {
  try{
    const user=req.user;
    res.send(user);
  }catch(err){
    res.status(400).send("Error "+ err.message);
  }
});

app.post("/sendconnectionrequest", userAuth ,(req,res)=>{
  const user=req.user;
  console.log("sending a connection request ");
  res.send(user.firstName +" sent a connection request ");
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
