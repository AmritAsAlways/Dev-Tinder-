const mongoose = require("mongoose");

// The connection string comes from the MONGODB_URI environment variable
// (set in your .env file locally, and in the hosting dashboard when deployed)
// so the database password is never written inside the source code.
// dbName makes sure we always use the original "devtinderbackend" database,
// even if the connection string has no database name in it.
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "devtinderbackend",
  });
};

module.exports = connectDB;
