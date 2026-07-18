const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://amritrajsingh300_db_user:SCn77I1Q4Exkkmce@devtinder.33hhxdk.mongodb.net/devtinderbackend",
  );
};

module.exports= connectDB;