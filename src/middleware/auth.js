const jwt=require('jsonwebtoken');
const User=require('../models/user');
//we are here not using the cookie-parser because this middleware is going to be used in the app.js where 
//before even this middleware runs the cookieparser middleware had already been exectuted so we donot have to parse it again 
//because the req.cookie we are using is already has been parsed 

const userAuth =async (req, res, next) => {
    try {
        const { tokenwallacookie } = req.cookies;
        if (!tokenwallacookie) throw new Error("token is not valid");
        const user = jwt.verify(tokenwallacookie, "secretmessaagehaibhaiye");
        const { _id } = user;//extracting id from the user 
        const userobject = await User.findById(_id);
        if (!userobject) throw new Error("user not present ");
        
        //as all the things are correct so authenication passed so return the user so the routes can use it
        req.user=userobject; //we passed the userobject in the user
        next();//now call the next route 
    } catch (err) {
        res.status(400).send("Error " + err.message);
    }
}

module.exports={
    userAuth,
};