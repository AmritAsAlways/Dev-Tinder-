const validator=require('validator')

const validatesignupdata = (req)=>{
    const {firstName , lastName , emailId , password }=req.body;

    if(firstName<3 || firstName>50 || lastName<3 || lastName>50){
        throw new Error("The Length of the names should be between 3-50");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Provide a valid EmailID");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Create a strong password");
    }
}

module.exports={
    validatesignupdata,
};