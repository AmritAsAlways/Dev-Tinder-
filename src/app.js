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


app.listen(7777,()=>{
  console.log("the server is listening on port 7777");
})
