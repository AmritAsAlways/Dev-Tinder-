const validator = require("validator");

  const validatesignupdata = (req) => {
    const { emailId, firstName, lastName, password } = req.body; //extracting all the field required in the
    //signup of the user from the request

    const firstNametrimmed=firstName.trim();
    const lastNametrimmed=lastName.trim();

    if (!firstNametrimmed) {
      throw new Error("First name is required");
    }
    if (!lastNametrimmed) {
      throw new Error("Last name is required");
    }
    if(firstNametrimmed.length<3 || firstNametrimmed.length>100) throw new Error("firstName should be between 3 to 100 characters");
    if(lastNametrimmed.length<2 || lastNametrimmed.length>100) throw new Error("lastName should be between 2 to 100 characters");
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
  const disallowedField = Object.keys(req.body).find((field) => {
    return !allowededitfields.includes(field);
  });
  if (disallowedField) {
    throw new Error(`Editing "${disallowedField}" is not allowed`);
  }

  // if gender was included in the edit but left blank/cleared, default it to
  // "others" instead of letting an empty string reach the schema validator
  // (which would reject it with "Gender data is not valid")
  if (Object.prototype.hasOwnProperty.call(req.body, "gender") && !req.body.gender) {
    req.body.gender = "others";
  }

  const { firstName, lastName, photoURL, skills, gender, about, emailId, age } =
    req.body;

  //after checking the allowedfields check if the input fields are valid or not
  //because we are not sure that the firstName , lastName , about is present in the update or not
  //if not present then we cannot run the check's
  // so here we are first checking that if that field exists or not if exits then only check for validation
  if (firstName !== undefined) {
    const firstNametrimmed = firstName.trim();
    if (firstNametrimmed.length < 3 || firstNametrimmed.length > 100) {
      throw new Error("firstName should be between 3 to 100 characters");
    }
  }

  if (lastName !== undefined) {
    const lastNametrimmed = lastName.trim();
    if (lastNametrimmed.length < 2 || lastNametrimmed.length > 100) {
      throw new Error("lastName should be between 2 to 100 characters");
    }
  }

  if (about && about.length > 500) {
    throw new Error("about should be less than or equal to 500 characters");
  }

  // age: required, and must be a number between 18 and 100
  if (age !== undefined) {
    if (age === null || age === "" || isNaN(Number(age))) {
      throw new Error("Age is required and must be a valid number");
    }
    if (Number(age) < 18 || Number(age) > 100) {
      throw new Error("Age should be between 18 and 100");
    }
  }

  if (emailId && !validator.isEmail(emailId)) {
    throw new Error("Enter a valid Email");
  }
  if (photoURL && !validator.isURL(photoURL)) {
    throw new Error("Enter a valid photo URL");
  }
  if (skills && skills.length > 10) {
    throw new Error("skills should be 10 or fewer");
  }
  if (skills) {
    const invalidSkill = skills.find((skill) => {
      const trimmed = skill.trim();
      return trimmed.length === 0 || trimmed.length > 10;
    });
    if (invalidSkill !== undefined) {
      throw new Error(
        `Each skill should be 1 to 10 characters (check: "${invalidSkill}")`,
      );
    }
  }
  if (gender && !["male", "female", "others"].includes(gender.toLowerCase())) {
    throw new Error("Gender data is not valid");
  }
};

module.exports = {
  validatesignupdata,
  validateEditProfileData,
};
