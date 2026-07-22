const express=require('express');
const requestRouter=express.Router();
const { userAuth } = require("../middleware/auth");

requestRouter.post("/sendconnectionrequest", userAuth ,(req,res)=>{
  const user=req.user;
  console.log("sending a connection request ");
  res.send(user.firstName +" sent a connection request ");
});

module.exports=requestRouter;