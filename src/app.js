require("dotenv").config();
const http = require("http");
const initializeSocket = require("./utils/socket");
const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors=require('cors');

const server = http.createServer(app);
initializeSocket(server);


//what is the use of express.Router() it is used to make a clean,scalable express application 
//as there were many routes which were present before the express.router() we use express.router() to group
//some routes into one forming one group router route 
//it allows us to divide routes into seperate files
//to use this we have to import express then make a express.Router() with some name and just use 
//it like we use normal router(app) just in the place of app replace it with that express.Router()
//So, a router is basically a mini Express application that handles a group of related routes.

//then how to import and use them in the main app.js file so to do this store the routes from the 
//files and using .use("/",routename) like this now we can use that routes

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials:true,
})); //it is a middleware which is used to resolve the cors problem which arrives when connection the frontend and the backend
//resolve this first name the frontend and backend as same like http:/localhost/5123 as similarly for the backend like http:/localhost/7777

app.use(express.json());
app.use(cookieParser());

const authRouter=require('./routes/auth');
const profileRouter=require('./routes/profile');
const requestRouter=require('./routes/request');
const userRouter=require('./routes/user');
const chatRouter = require("./routes/chat");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);
app.use("/", chatRouter);

// Reached only if no route above matched. Without this, an unmatched route
// falls through to Express's default 404 handler, which sends back a raw
// HTML "Cannot GET /..." page instead of something the frontend can parse
// cleanly.
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Global error handler — catches anything that slips past an individual
// route's own try/catch (errors thrown in middleware before a route runs,
// unexpected synchronous throws, rejected promises Express catches on its
// own, etc). This MUST be defined last, after every other app.use()/route.
// Without it, Express falls back to its DEFAULT error handler, which sends
// a raw HTML stack-trace page — that's the garbled markup that was showing
// up in the frontend's error box instead of a clean message.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong " + err.message);
});

connectDB()
  .then(() => {
    console.log("Database connection is established");
    const PORT = process.env.PORT || 7777;
    server.listen(PORT, () => {
      console.log("the server is listening on port " + PORT);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected " + err.message);
  });
