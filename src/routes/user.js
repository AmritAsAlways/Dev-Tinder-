const express = require('express');
const userRouter = express.Router();
const { connectionRequestModel } = require("../models/connectionRequest");
const User =require("../models/user");
const { userAuth } = require("../middleware/auth");

const USER_SAFE_DATA=["firstName","lastName","photoURL","age","gender","about","skills"]
//it gives us all the essential information we want from the userobject through population

//gets us all the pending/interested connection requests for that loggedIn user
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

//contains all the essential information related to userobjects which either sent the connectionrequest or to whom the connectionrequest
//has been sent by the loggedinuser
userRouter.get("/user/connections", userAuth , async (req,res)=>{
    try{
        const loggedInUser=req.user;

        //it gives us all connectionrequests where the either the touserid is of loggedinuser or the fromuserid is of loggedinuser 
        //and the status of connectionrequest in both the cases is accepted 
        const connectionrequest = await connectionRequestModel.find({
            $or:[
                {toUserId:loggedInUser._id , status:"accepted"}, 
                {fromUserId:loggedInUser._id , status:"accepted"},
            ],
        }).populate("fromUserId",USER_SAFE_DATA).populate("toUserId",USER_SAFE_DATA);

        //it contains the list of all the user who has either send a connectionrequest to loggedinuser or the loggedinuser has sent a connection
        //request to them
        const data=connectionrequest.map((fieldshaibhai)=>{
            if(fieldshaibhai.fromUserId._id.toString() === loggedInUser._id.toString()) return fieldshaibhai.toUserId;
            return fieldshaibhai.fromUserId;
        });
        //as here fieldshaibhai.fromUserId and loggedinuser are both objects and we cannot evaluate the both objects using only === operator
        //so to evaluate the id's of both we first convert them both into a string and then do the verification 

        res.json({data});
    }
    catch(err){
        res.status(400).send("Error : "+ err.message);
    }
});

//building the api for the feed of the user

//what is pagination? it is process in which the we donot return the user all the users it we give it in pieces 
//let say the route is like this /feed/page=1&limit=10 it means that return user from 1-10
///feed/page=2&limit=10 it means that return user from 11-20
//feed/page=3&limit=10 it means that it return user from 21-20

//and in the mongodb there are some methods like that .skip() and that limit() methods what they does is that 
//if written .skip(0) and .limit(10) it means that it means skip the first 0 user and return next 10 users means 0-10
//if written .skip(10) and .limit(10) it means that it skips the first 10 users and return next 10 users means 11-10

//initially our feed api was /feed but lets say we set that limit of the feed api as 10 so the new api will be 
///user/feed/?page=1&limit=10
userRouter.get("/feed", userAuth, async (req,res)=>{
    //.params means when we pass in the information in the api like this /feed/:skip/:limit
    //but to access the information if the api is like this /feed?page=1&limit=10 we use query not params

    try{
        const loggedInUser = req.user; //this is the loggedInuser

        let page=parseInt(req.query.page) || 1 ;//here req.query.page is a string and parseInt convert's this into a integer and if the
        //user doesnot provide any page information then assume it to be 1
        let limit=parseInt(req.query.limit) || 10;
        limit=(limit>50) ? 50 : limit;
        if(page<1) page=1;

        //what is the value of the skip and how we will find what number of users to skip
        const skip=(page-1)*limit;

        //what are the userobject/users/person's cards  who i donot want in the feed
        //1.own card
        //2.his connections
        //3.ignored peoples
        //4.already sent the connection request 

        //find all the connection requests (sent+received)
        const connectionrequest=await connectionRequestModel.find({
            $or:[{fromUserId:loggedInUser._id},{toUserId: loggedInUser._id}],
        })
        .select("fromUserId toUserId")
        // .populate("fromUserId" ,["firstName","lastName"]).populate("toUserId",["firstName","lastName"]);
        //if we donot use the select method then it will return all the connection requests where either touserid or fromuserid is present with all the information
        //like creating data updation data status and _id but we donot want them we only want the info of the fromUserId and toUserId so use select 

        const hideusersfromfeed= new Set(); //using the help of the set database we have found all those id's which we donot want in our feed
        connectionrequest.forEach((req)=>{
            hideusersfromfeed.add(req.fromUserId.toString());
            hideusersfromfeed.add(req.toUserId.toString());
        })

        const user=await User.find({ //helps us to find all the user with id's except for those user's whose id's are present in the hideuserfromfeed and whose id is not equal's to the id of the loggedinuser
            $and:[
                {_id: { $nin: Array.from(hideusersfromfeed)}}, //whose id is not present in the hideusersfromfeed
                {_id: {$ne:loggedInUser._id}},// and whose id is not equal's to the id of the loggedinuser
             ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit); //if we donot pass anything in skip it will take 0 as input and if we donot pass anything in the limit it will take all the users as input 
        //this skip method and limit method helps 

        //this method/functionn Array.from() is used to convert a set into a array
        //we can study about these logical query from the mongodb logical query section and comparison query section in the documentation of mongodb

        res.send(user); //this is the list of all those users whose data i have to send back 
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
})

module.exports = userRouter;