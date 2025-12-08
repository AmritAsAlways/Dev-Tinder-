const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://namastedev:IWUyl2DRFm0UGNFm@namastenode.w5wwfvy.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
