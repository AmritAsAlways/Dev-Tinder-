const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    //now as we have got the cookie now we will use it to access the /profile
    //to get the cookie's from the browser/user we are given a method by express js
    //this will give us all the cookie
    const cookies = req.cookies;

    //now as we know that cookies contain token so we will extract the token form the cookie
    const { token } = cookies;
    if (!token) {
      throw new Error("Invalid Request");
    }

    //and we will validate the token and if it fails the validation then we will return the
    //message to please login
    //because we can set the timer that this cookie and token is only valid upto a specific time
    //after then you have to again login but can we can also not set any time limit it is upto us
    //and if we set no timer so we dont have to check for the validation of token but for security we do this

    const istokenvalid = await jwt.verify(token, "DEV@TINDER#790"); //here we pass our token and the
    //secret key which only the server knows and it gives us a decoded value

    //and in the decoded message it will give us the what ever we were hiding inside the token
    const { _id } = istokenvalid;

    // find the user
    const user = await User.findById(_id);
    if(!user){
      throw new Error("The User donot exist");
    }
    req.user=user;
    next();
  } catch (err) {
    res.status(400).send("Invalid Credentials");
  }
};

module.exports = {
  userAuth,
};
