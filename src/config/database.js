const mongoose = require("mongoose")

const connectDB= async ()=>{
    await mongoose.connect("mongodb+srv://namastedev:IWUyl2DRFm0UGNFm@namastenode.w5wwfvy.mongodb.net/");
};

connectDB().then(()=>{
    console.log("Database Connection established ....");
}).catch((err)=>{
    console.log("Database cannot be connected!!");
});

