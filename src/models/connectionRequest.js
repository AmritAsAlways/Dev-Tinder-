const mongoose = require('mongoose');

const connectionRequestSchema= new mongoose.Schema({
    fromUserId:{
        type: mongoose.Schema.Types.ObjectId,
        //as we want to make a relation between the both schema's so here we want that there should be a relation between the fromuserid field and the userschema model
        //and to make this we are using reference keyword and type the name of the schema you want to have a relation between 
        ref: "User", //reference to the user collection 
        required:true,
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status:{
        type: String,
        enum:{ //this is the way to use enum in mongoose 
            values: ["ignored","interested","accepted","rejected"],
            message: `{vales} is incorrect status type `,
        },
    },
},
{
    timestamps:true, // to the time at which the connection has been send
});

//when in the code we use method's like these .findbyOne or .findbyId these methods are expensive methods and takes a lot of time to get 
// us the data from the database but if the database is very big it can make the database hang also
//so to deal with this problem we came with a solution that is we will use index on the fields that we are going to use to find the user
//Index is a way to improve the search in the database 
//if in the user model shema there exits a field with the unique keyword as true means that it's indexing of that field has already been taken care of 
//by the mongodb with if we want to have index on a single field then we write just index keyword in the field and make it 1 or -1 write about it from the mongoose doucmentation
//but if the number of field is more that 1 i.e 2 or 3 in those cases we will use compund indexing to index multiple fields like this 
connectionRequestSchema.index({fromUserId:1 , toUserId:1})



//there is something known as mongoose pre which acts as middleware and we can use it to set
//validation on to the model schema right there when they are made 
//the function which we write over there is a normal function not a arrow function as arrow function donot work here
//and this is how we use it

//it is mandatory to have check's like these but it is a good practise
connectionRequestSchema.pre("save", function(){
    //as this is a middleware this method will be called anytime model is saved this middleware will run
    const connectionrequest = this;
    //check if the fromUserId === toUserId
    if(connectionrequest.fromUserId.equals(connectionrequest.toUserId)) throw new Error("Cannot send connection request to yourself ");
    // next(); //and you have to call next() as it is a middleware but in modern node.js we donot need to call next() method here and also we 
    //donot have to put next as a arugment in the function which is necessary in previous methods
})

const connectionRequestModel= new mongoose.model("connectionRequestModel",connectionRequestSchema);

module.exports = {
    connectionRequestModel,
}