const express = require("express");
const app = express();

const { AdminAuth, UserAuth } = require("./middleware/auth");

// if we do app.get("/user",(req,res)=>{}) and we send no response from the get
//then what will happen is that the express will continuously ask/wait for the
//response to come and it will not come then it will stop looking for the response
//after sometimess

//we can send multiple request handlers at once ,next() tells us that there is also a
//another request handler which you should check
//now we can play with next and res.send() but changing there position here and there
//instead of request handlers we can use a array of request handler's also it
//will also do the same thing no change

// app.get("/user",(req,res,next)=>{
//   console.log("request handler 1");
//   res.send("Handler 1");
//   next();
// },
// [(req,res,next)=>{
//   console.log("request handler 2");
//   res.send("Handler 2");
//   next();
// },
// (req,res,next)=>{
//   console.log("request handler 3");
//   res.send("Handler 3");
//   next();
// }],
// (req,res,next)=>{
//   console.log("request handler 4");
//   res.send("Handler 4");
//   // next();
// }
// );

//and instead of mutliple request handler in one route we can create multiple routes
//we can also write it like this no change in output

// app.get("/user", (req, res, next) => {
//   console.log("request handler 1");
//   res.send("Handler 1");
//   next();
// });
// app.get("/user", (req, res) => {
//   console.log("request handler 2");
//   res.send("Handler 2");
// });

//what are middlewares : these are terms used for the route handler in which
//these are those route handlers in which which donot send any response back
//and are used as the bridge to go to that route handlers which actually sent
//the response

//like this in this example
//here this is acting as a middleware for the route handlers and it is handling the
//and the logic to the route handlers has to pass through this middleware
//is the AdminAuthentication logic written here
app.use("/admin", AdminAuth);

app.get("/user/login", (req, res) => {
  res.send("the user has been logged in");
});

app.get("/user", UserAuth, (req, res) => {
  res.send("user data sent");
});

app.get("/admin/getAllData", (req, res) => {
  //logic for checking if the request is authorized

  res.send("All Data Sent");

  // const token = "xyzafala";
  // const isAuthorized = token === "xyz";
  // if (isAuthorized) {
  //   res.send("All Data Sent");
  // } else {
  //   res.status(401).send("Unauthorized Request");
  // }
});

app.get("/admin/DeleteUser", (req, res) => {
  //logic for checking if the request is authorized

  res.send("Deleted a User");

  // const token = "xyzafala";
  // const isAuthorized = token === "xyz";
  // if (isAuthorized) {
  //   res.send("Deleted a User");
  // } else {
  //   res.status(401).send("Unauthorized Request");
  // }
});

app.listen(7777, () => {
  console.log("The server is listening on the port 7777...");
});
