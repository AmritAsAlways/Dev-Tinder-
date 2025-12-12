const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const { validatesignupdata } = require("./utils/validators");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken"); //we use this create tokens
const {userAuth} = require("./middleware/auth");

app.use(express.json()); // it is a middleware given by the express and as it is a middleware with no
//route means it works on every routes and convert any json data given the user to the js object format
//so we can use it

//we are using it because we cannot read our cookies from the browser/user directly first it has
//to pass through this middleware and after it passes through the middleware then we can access our
//cookies form the express req.cookies method
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    //validate the request
    validatesignupdata(req);

    //make the password hash
    const { firstName, lastName, emailId, password } = req.body;

    const HashedPassword = await bcrypt.hash(password, 10);

    // const user = new User(req.body); entering data like this is a bad practise
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: HashedPassword,
    });
    await user.save();
    res.send("user signedup successfully ");
  } catch (err) {
    res.status(400).send("error saving the data " + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    //if the emailId given to us is valid or not
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid Credentials");
    }

    //if the emailId given to us is present in the database or not
    const person = await User.findOne({ emailId });
    //as the emailId field is unique then if the person is already registered then it should return only one
    //object and if not present the it will be null

    if (person.length === 0) {
      throw new Error("Invalid Credentials");
    }

    //now use the compare method given to us by the bcrypt
    const samepassword = await bcrypt.compare(password, person.password);

    if (!samepassword) {
      throw new Error("Invalid Credentials");
    }

    // will create a JWT TOKEN in the token there are 3 parts i.e header,middlepart(we will hide the
    //things we want to hide ) and the signature and inside the {} we hide the things we want to hide

    console.log(person._id);

    const token = await jwt.sign({ _id: person._id }, "DEV@TINDER#790",{expiresIn : "1d",}); //i am hiding this _id information inside this token
    //and i will also give a secret key to this token which only server knows
    console.log(token);

    //add the token to the cookie and send the response back to the browser/user
    //for this we will use the method given by the express to
    res.cookie("token", token ,{expires : new Date(Date.now() + 8*3600000) , httpOnly : true }); //this cookie will expire in next 8 hr
    res.send("Login Successfull");
  } catch (err) {
    res.status(400).send("Invalid Credentials");
  }
});

app.get("/profile", userAuth , async (req, res) => {
  try {

    const user= req.user;
    res.send(user);

  } catch (err) {
    res.status(400).send("Invalid Credentials");
  }
});

app.post("/sendconnectionrequest",userAuth ,(req,res)=>{
  const user=req.user;
  res.send(user.firstName + "sent the connection request ");
})

//get user by the email
app.get("/user", async (req, res) => {
  const useremail = req.body.emailId;

  try {
    // const person=await User.findOne({emailId: useremail})
    const person = await User.find({ emailId: useremail });

    if (person.length === 0) {
      res.status(404).send("user not found");
    } else {
      res.send(person);
    }
  } catch (err) {
    res.status(400).send("something went wrong ");
  }
});

//feed api - get all the users from the database
app.get("/feed", async (req, res) => {
  try {
    const person = await User.find({});

    if (person.length === 0) {
      res.status(404).send("users not found");
    } else {
      res.send(person);
    }
  } catch (err) {
    res.status(400).send("something went wrong ");
  }
});

//id api - get the user by the id
app.get("/id", async (req, res) => {
  const id = req.body._id;
  try {
    const person = await User.findById({ _id: id });

    if (person.length === 0) {
      res.status(404).send("users not found");
    } else {
      res.send(person);
    }
  } catch (err) {
    res.status(400).send("something went wrong ");
  }
});

//delete the user api- delete the user by the id
app.delete("/userdelete", async (req, res) => {
  const user_id = req.body.userid;

  try {
    await User.findByIdAndDelete({ _id: user_id });
    res.send("user deleted successfully");
  } catch (err) {
    res.status(400).send("something went wrong ");
  }
});

//update a user with the help of id
app.patch("/userupdatebyid/:userid", async (req, res) => {
  const user_id = req.params?.userid;
  const user = req.body;

  try {
    const ALLOWED_UPDATES = ["photourl", "about", "skills", "gender", "age"];
    const isUpdateallowed = Object.keys(user).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateallowed) {
      throw new Error("Update not allowed");
    }
    // if (user?.skills.length > 10) {
    //   throw new Error("number of skills should not exceed 10");
    // }
    // const person=await User.findByIdAndUpdate(user_id,user)
    const person = await User.findByIdAndUpdate(user_id, user, {
      returnDocument: "before",
      runValidators: true,
    }); //here the third parameter is options
    //there are various types of options choosing different options will result in different person
    //output we can read about different options from the documenation
    console.log(person);
    res.send("user data has been updated");
  } catch (err) {
    res.status(400).send("user data has not been updated");
  }
});

//update path: update the data of the user without the id
app.patch("/userupdate", async (req, res) => {
  const user_id = req.body.emailId;
  const user = req.body;

  try {
    const ALLOWED_UPDATES = ["photourl", "about", "skills", "gender", "age"];
    const isUpdateallowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateallowed) {
      throw new Error("Update not allowed");
    }
    if (data?.skills.length > 10) {
      throw new Error("number of skills should not exceed 10");
    }
    // const person=await User.findByIdAndUpdate(user_id,user)
    const person = await User.findOneAndUpdate({ emailId: user_id }, user, {
      returnDocument: "after",
      runValidators: true,
    }); //here the third parameter is options
    //there are various types of options choosing different options will result in different person
    //output we can read about different options from the documenation
    console.log(person);
    res.send("user data has been updated");
  } catch (err) {
    res.status(400).send("user data has not been updated");
  }
});

connectDB()
  .then(() => {
    console.log("Database Connection established ....");
    app.listen(7777, () => {
      console.log("The server is listening on the port 7777...");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected!!");
  });
