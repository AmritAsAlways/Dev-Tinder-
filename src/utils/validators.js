const validator = require("validator");

  const validatesignupdata = (req) => {
    const { emailId, firstName, lastName, password } = req.body; //extracting all the field required in the
    //signup of the user from the request

    const firstNametrimmed=firstName.trim();
    const lastNametrimmed=lastName.trim();

    if (!firstNametrimmed || !lastNametrimmed) {
      // this validation is not required as these are already checked in the user shema level validations but aise hi kardiya
      throw new Error("Name is not valid");
    } 
    if(firstNametrimmed.length<3 || firstNametrimmed.length>100) throw new Error("firstName should be between 3 to 100 characters");
    if(lastNametrimmed.length>100) throw new Error("lastName should be less than or equal to 100 characters");
    if (!validator.isEmail(emailId)) {
      // this validation is not required as these are already checked in the user shema level validations but aise hi kardiya
      throw new Error("Enter a valid Email");
    } 
    if (!validator.isStrongPassword(password)) {
      // this validation is not required as these are already checked in the user shema level validations but aise hi kardiya
      throw new Error("Enter a strong password");
    }
  };

const validateEditProfileData = (req) => {
  //all the allowededitfields
  const allowededitfields = [
    "firstName",
    "lastName",
    "emailId",
    "photoURL",
    "skills",
    "gender",
    "age",
    "about",
  ];

  //check if all the allowedfiles are present or not/ or if there is no other fields whose edit is not allowed
  const isEditAllowed = Object.keys(req.body).every((field) => {
    return allowededitfields.includes(field);
  });
  const { firstName, lastName, photoURL, skills, gender, about, emailId } =
    req.body;

  //after checking the allowedfields check if the input fields are valid or not
  // if(firstName.length<3 || firstName.length>100 || lastName.length>100 || about.length>100) return false; all these are wrong
  //because we are not sure that the firstName , lastName , about is present in the update or not
  //if not present then we cannot run the check's
  // so here we are first checking that if that field exists or not if exits then only check for validation
  const firstNametrimmed=firstName.trim();
  const lastNametrimmed=lastName.trim();
  if (firstNametrimmed.length < 3 || firstNametrimmed.length > 100) {
    return false;
  }

  if (lastNametrimmed.length < 3 || lastNametrimmed.length > 100) {
    return false;
  }

  if (about && about.length > 500) {
    return false;
  }

  if (emailId && !validator.isEmail(emailId)) return false;
  if (photoURL && !validator.isURL(photoURL)) return false;
  if (skills && skills.length > 10) {
    return false;
  }
  const isSkillsValid = Array.isArray(skills) && skills.every(skill => {
    const trimmed = skill.trim();
    return trimmed.length > 0 && trimmed.length <= 10;
  });
  if(isSkillsValid === false) return false;
    if (gender && !["male", "female", "others"].includes(gender.toLowerCase()))
      return false;

    return isEditAllowed;
  };

module.exports = {
  validatesignupdata,
  validateEditProfileData,
};
