const validator=require('validator');

const validatesignupdata = (req)=>{
    const {emailId,firstName,lastName,password}=req.body;//extracting all the field required in the
    //signup of the user from the request 

    if(!firstName || !lastName){// this validation is not required as these are already checked in the user shema level validations but aise hi kardiya
        throw new Error("Name is not valid");
    }
    else if(!validator.isEmail(emailId)){ // this validation is not required as these are already checked in the user shema level validations but aise hi kardiya
        throw new Error("Enter a valid Email");
    }
    else if(!validator.isStrongPassword(password)){ // this validation is not required as these are already checked in the user shema level validations but aise hi kardiya
        throw new Error("Enter a strong password");
    }
}

module.exports={
    validatesignupdata,
};

