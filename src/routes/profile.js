const express=require('express');
const profileRouter=express.Router();
const { userAuth } = require("../middleware/auth");

//now we will create a api for /profile to check the logic of cookie and token
profileRouter.get("/profile",userAuth,async (req, res) => {
  try{
    const user=req.user;
    res.send(user);
  }catch(err){
    res.status(400).send("Error "+ err.message);
  }
});

module.exports=profileRouter;
