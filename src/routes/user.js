const express = require('express');
const userRouter = express.Router();
const { connectionRequestModel } = require("../models/connectionRequest");
const { userAuth } = require("../middleware/auth");

userRouter.get("/user/requests/received" , userAuth , async (req,res)=>{
    //at first validate the user by passing it through the userAuth middleware
    try{
        const loggedInUser=req.user;

        const connectionrequests=await connectionRequestModel.find({
            toUserId: loggedInUser._id, // i only want those connections whose touserid is the userid of the loggedinuser
            //and the status of the connection request is interested means we only want to see those connection requests whose status is interested not ignored
            status: "interested"

            //now to get some data from the user schema we will populate this 
        }).populate("fromUserId",["firstName","lastName","photoURL","age","gender","about","skills"]); //it means that inside the fromuserid field population this list of data into that field
        //means these data which is originally from the user table will get populate this fromuserid field and if
        //we donot pass in any list like if we only pass this .populate("fromUserId") then it will populate the whole user object with the id of formuserid and put it inside the 
        //fromuserid field 
        //we can also send the list of fields like this "firstName lastName photoURL age gender about skills"



        //now the problem here is that we are getting the fromUserId and toUserid's of the connectionrequests which means we are getting the id's of person's who are 
        //giving the connection status as interested as touserid is the loggedinuser but it does not gives us any of the information related to the sender's usermodel 
        //expect for the id 

        //so to get that info what we can do is that we can loop over all the connectionrequest and using .findbyid we can extract the info but this process is not efficient
        //the most efficient method is that we should build a relation between 2 schema's or collections and we can do this using the .populate method 
        //now go to the connectionrequestfile method to read about it

        res.json({message:"All connection requests are fetched successfully!!",
            data: connectionrequests,
        });
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
})

module.exports = userRouter;