const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
//what is the use of express.Router() it is used to make a clean,scalable express application 
//as there were many routes which were present before the express.router() we use express.router() to group
//some routes into one forming one group router route 

app.use(express.json());
app.use(cookieParser());

const userRouter=require('./routes/auth');
const profileRouter=require('./routes/profile');
const requestRouter=require('./routes/request');

app.use("/",userRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);

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
