const express = require('express');

const app = express();

//app.use() method takes 2 parameters one is route("/sfa") and the other 
//parameter is known as the request handlers
// (req,res)=>{ }
//this is known as request handlers 

//in the routes are checked from top to bottom and if the route is like this 
// /test/fafafa(anything) then the server will select this route(/test) 
// but /test2/(anything) server will not (/test) because /test and /test2 
//both are two different types of strings 

//and if "/" is there in the route is then anything after this will be selected
//server checks from top to bottom and match each route with the requested route
//which ever matches the criteria will be selected 


//app.use() matches all the http methods it does not matter whether get,post,put,or delete 
//is used it all gives the same answer in return to test api's we use the postman not the browser 
//because it is hard to test through the browser 



// app.use("/test", (req, res) => {
//   res.send("hi test!");
// });

// app.use("/", (req, res) => {
//   res.send("Hello hi bye!");
// });

// app.use("/hello2", (req, res) => {
//   res.send("Hello");
// });

// app.use("/hello", (req, res) => {
//   res.send("Hello");
// });


//now when we will run this for every http request at /user response will be the same
//that is HAHAH because the .use is before every other http request 
//hence to avoid these we use specific http methods before the generic one's

// app.use("/user",(res,req)=>{
//   res.send("HAHAHA");
// })

// //this will only handle the get requests to the /user
// app.get("/user",(req,res)=>{
//   res.send({firstName:"Amrit Raj",lastName:"Singh"});
// });

// //this will handle all post request to the /user
// app.post("/user",(req,res)=>{
//   res.send("This response has been saved in the databases");
// });


//in the routes if routes are like this means /ab?c means here b can be ignored as well
//in the routes if the routess are like this /a(bc)+d means that /a(anynumberoftimesbc)d is accepted


//suppose we have a url like this /localhost:7777/user?userId:101 how can we 
//get the userId from the route handler 
//use res.query to get all the query parameters
app.get("/user",(req,res)=>{
  console.log(req.query);
  res.send("another get http request to the /user");
})


//if we have a url like this /user/708 we can handle it using the route parameters
app.get("/user/:userId",(req,res)=>{
  console.log(req.params);
  res.send("another one");
})

//complex routes using multiple parameters 
app.get("/user/:userId/:name/:password",(req,res)=>{
  console.log(req.params);
  res.send("complex params");
})


//some more regex here are 
//   /.*fly$/ This is a valid regex. It means:
// ➝ Match ANY URL ending with "fly".
// Breakdown:
// . → any character
// * → zero or more times
// .* → any number of any characters
// fly → literal text "fly"
// $ → end of string

// path:/a/
// meaning: literal path /a/
// matches exactly with this : /a/


app.listen(7777, () => {
  console.log("The server is listening on the port 7777...");
});

