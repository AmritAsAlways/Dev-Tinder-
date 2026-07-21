const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb://amritrajsingh300_db_user:newpassword@ac-8ezc3qe-shard-00-00.33hhxdk.mongodb.net:27017,ac-8ezc3qe-shard-00-01.33hhxdk.mongodb.net:27017,ac-8ezc3qe-shard-00-02.33hhxdk.mongodb.net:27017/devtinderbackend?ssl=true&replicaSet=atlas-ie893k-shard-0&authSource=admin&appName=DevTinder"
  );
};

module.exports = connectDB;