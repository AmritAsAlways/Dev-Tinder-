const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://amritrajsingh300_db_user:SCn77I1Q4Exkkmce@devtinder.33hhxdk.mongodb.net/devtinderbackend",
  );
};

connectDB().then(()=>{
  console.log("Database connection is established");
}).catch((err)=>{
  console.error("Database cannot be connected");
})