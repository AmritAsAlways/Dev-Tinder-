const express = require("express");
const app = express();
require("./config/database")

app.get("/user",(req,res)=>{
  try{
    res.send("logic to get data from the DB");
  }
  catch(err){
    res.status(500).send("some error has occured ");
  }
});

app.use("/",(err,req,res,next)=>{
  if(err){
    res.status(500).send("something went wrong");
  }
})

app.listen(7777, () => {
  console.log("The server is listening on the port 7777...");
});
