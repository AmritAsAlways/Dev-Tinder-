const express = require("express");
const app = express();
const connectDB=require("./config/database")
const User=require("./models/user");


//the difference between the patch rest api and the put restapi is that in put restapi we change the whole model schema of the
//the data stored and if anything is not given we mark them as null but in the patch we change only that
//thing which is given to be changed
//before update ----> 
// {
//   "name": "Amrit",
//   "email": "amrit@gmail.com",
//   "age": 21
// }
// THE UPDATE --->
// {
//   "name": "Amrit Raj"
// }
// THE ANSWER FROM THE PUT -->
// {
//   "name": "Amrit Raj",
//   "email": null,
//   "age": null
// }
// THE ANSWER FORM THE PATCH -->
// {
//   "name": "Amrit Raj",
//   "email": "amrit@gmail.com",
//   "age": 21
// }



//what is the difference between the js object and the json
//JSON---> JSON is always a string (data format),json can be send over the internet but js object cannot
//json cannot have functions and undefined also ,json object is an actual object in memory 

//JS OBJECT --> js object is a real object in javascript memory ,not a string it is a data structure,
//can contain anything functions ,symbol , undefined ,dates ,methods ....,
//follows javascript syntax not json rules



app.use(express.json()); // it is a middleware given by the express and as it is a middleware with no
//route means it works on every routes and convert any json data given the user to the js object format
//so we can use it 

app.post("/signup",async (req,res)=>{
  // console.log(req.body)

  
  // const userobj={
  //   firstName:"Amrit Raj",
  //   lastName:"Singh",
  //   emailId:"amrit@gmail.com",
  //   password:"passsword"
  // }

  // const user= new User(userobj);

  const user=new User(req.body); // the data given by the user will be in the req.body part so to 
  //access it we will first convert this req.body which is in json format to the js object format 
  //which is done by the express.json() and we will then extract that js object by  req.body and will
  //user it from now then

    //now after doing all this we can now give data to the database dynamically 
  try{
    await user.save();
    res.send("user signedup successfully ");
  }
  catch(err){
    res.status(400).send("error saving the data " + err.message)
  }
})

//get user by the email
app.get("/user",async (req,res)=>{
  const useremail=req.body.emailId

  try{
    // const person=await User.findOne({emailId: useremail})
    const person=await User.find({emailId: useremail})

    if(person.length === 0 ){
      res.status(404).send("user not found");
    }
    else{
      res.send(person);
    }
  }
  catch(err){
    res.status(400).send("something went wrong ")
  }
})

//feed api - get all the users from the database
app.get("/feed",async (req,res)=>{
  
  try{
    const person=await User.find({})

    if(person.length === 0 ){
      res.status(404).send("users not found");
    }
    else{
      res.send(person);
    }
  }
  catch(err){
    res.status(400).send("something went wrong ")
  }
})

//id api - get the user by the id
app.get("/id",async (req,res)=>{
  const id=req.body._id
  try{
    const person=await User.findById({_id: id})

    if(person.length === 0 ){
      res.status(404).send("users not found");
    }
    else{
      res.send(person);
    }
  }
  catch(err){
    res.status(400).send("something went wrong ")
  }
})

//delete the user api- delete the user by the id
app.delete("/userdelete",async (req,res)=>{
  const user_id=req.body.userid;

  try{
    await User.findByIdAndDelete({_id: user_id});
    res.send("user deleted successfully");
  }
  catch(err){
    res.status(400).send("something went wrong ")
  }
})

//update a user with the help of id
app.patch("/userupdatebyid",async (req,res)=>{
  const user_id=req.body.userid;
  const user=req.body;

  try{
    // const person=await User.findByIdAndUpdate(user_id,user)
    const person=await User.findByIdAndUpdate(user_id,user,{returnDocument:'before',runValidators: true})//here the third parameter is options
    //there are various types of options choosing different options will result in different person
    //output we can read about different options from the documenation 
    console.log(person)
    res.send("user data has been updated");
  }
  catch(err){
    res.status(400).send("user data has not been updated")
  }
})

//update path: update the data of the user without the id
app.patch("/userupdate",async (req,res)=>{
  const user_id=req.body.emailId;
  const user=req.body;

  try{
    // const person=await User.findByIdAndUpdate(user_id,user)
    const person=await User.findOneAndUpdate({emailId:user_id},user,{returnDocument:'after',runValidators: true})//here the third parameter is options
    //there are various types of options choosing different options will result in different person
    //output we can read about different options from the documenation 
    console.log(person)
    res.send("user data has been updated");
  }
  catch(err){
    res.status(400).send("user data has not been updated")
  }
})

connectDB().then(()=>{
    console.log("Database Connection established ....");
    app.listen(7777, () => {
      console.log("The server is listening on the port 7777...");
    });
}).catch((err)=>{
    console.log("Database cannot be connected!!");
});
