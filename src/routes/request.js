const express=require('express');
const requestRouter=express.Router();
const { userAuth } = require("../middleware/auth");
const {connectionRequestModel }= require("../models/connectionRequest");
const User =require("../models/user");
//change the path and import all the necessary methods and library needed to run all those routes 

requestRouter.post("/request/send/:status/:userId", userAuth ,async (req,res)=>{
  //here status can be ignored or it can be interested 
  //and the userId will be of the user whom we want to send the connection and to get the 
  //toUserId we can get that from userAuth req.user can before this api will work it has to pass through 
  //userauth middleware and there it will return the user in the form of req.user
  try{
    const loggedInuser=req.user;
    const fromUserId=loggedInuser._id;
    const status = req.params.status;
    const toUserId=req.params.userId;

    //first sanitize the data
    //only ignored and interested should be allowed
    const allowedstatus=["ignored","interested"];
    if(!allowedstatus.includes(status)){
      return res.json({message: "Invalid status type ",
        status,
      });
    }

    //we can write the logic to check that if the userid of the touser and fromuser are same or not 
    //but we can check this condition inside the connectionrequestmodel schema also as mongoose provides us a method to do this 
    //but we can write the check here also
    //if(fromUserId===toUserId) throw new Error("cannot send connection request to yourself"); no problem in this code also 

    //checking if the toUserId(user) even exists in the database or not
    const touser=await User.findById(toUserId);
    if(!touser){
      return res.status(400).send({message: " User not found "});
    }

    //check if the request fromuser to touser has already been  made or touser has already send the request
    const existingconnectionrequest=await connectionRequestModel.findOne({
      $or:[
        {fromUserId, toUserId},
        {fromUserId:toUserId, toUserId:fromUserId},
      ]
    })
    //in the mongoose  we use this $or query to combine 2 or more logic's into 1 logic 

    if(existingconnectionrequest){
      return res.status(400).send({message: "Connection has already been sent "});
    }

    //now first create an instance of the model
    const connectionRequest=new connectionRequestModel({
      fromUserId,
      toUserId,
      status,
    });

    const data=await connectionRequest.save();
    res.json({
      message:`${loggedInuser.firstName } is ${ status } in ${touser.firstName} }`,
      data,
    });
  }
  catch(err){
    res.status(400).send("something went wrong "+err.message);
  }
});

requestRouter.post("/request/review/:status/:userId", userAuth , async (req,res)=>{
  try{
    //first get the user which is currently logged in with the help of the userAuth
    const loggedInUser=req.user;
    const status=req.params.status,requestId=req.params.userId;
    //now we will first validate the input given by the user

    //check if the status of the api is "accepted" or "rejected"
    if(!["accepted","rejected"].includes(status)){
      return res.status(400).json({message: "Invalid status provided "});
    }

    const connectionRequest=await connectionRequestModel.findOne({
      _id: requestId,     //check if the userId is a genuine id of the user and also if userId is the Id of the person who is loggedin currently
      toUserId: loggedInUser._id,
      //and we only need those connectionrequestmodels's whose touserId is the userId of the loggedInUser and 
    //and status is interested and 
      status : "interested", 
    })
    //now why we wrote this it is because there can be multiple such connectionrequest's in the database where the touserid is the id of the loggedinuser and the status is interested
    //but lets say i want to only get the 2nd connectionrequest with which the  above 2 criteria are  matching 
    //then how can i get that exact connectionrequest so to get that we are putting the _id of that connectionrequest into the req argum. and 
    //we are extracting it as requestId so 
    //this code really means is that a connectionrequest with _id as requestId and touserId as loggedinuser'id and status as interested which will be only 1 connection request 
    //which satisfy's all condition so to extract that we are using the .findOne() method here 

    //if no such connectionrequest exits
    if(!connectionRequest){
      return res.status(404).json({message: " Connection request not found "});
    }

    //now if all the condition matched then change the status of the connectionrequest status to either accepted or rejected
    connectionRequest.status=status;

    const data = await connectionRequest.save();
    res.json({message: "Connection Data " + status,
      data,
    });
  }
  catch(err){
    res.status(400).send("Something went wrong "+err.message);
  }
});

module.exports=requestRouter;