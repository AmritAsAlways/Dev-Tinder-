const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validators");
const bcrypt = require("bcrypt");
const validator = require("validator");
//change the path and import all the necessary methods and library needed to run all those routes
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

//now we will create a api for /profile to check the logic of cookie and token
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    //first we will do sanitize the data given to us by the user
    if (!validateEditProfileData(req)) throw new Error("Invalid edit request ");

    //now to access the profile/edit user has to go to userAuth middleware here after
    //autherizing the user we have passed the userobject inside the req.user so now extract that user from
    //that req.user
    const loggedInUser = req.user; //userAuth middleware has attached the userobject to this so
    // console.log(loggedInUser);

    //now after finding out the loged in user we can change the user info like this loggedInUser.firstName = req.body.firstName and similarly so on but
    //there is better way to do it
    Object.keys(req.body).forEach((keys) => {
      loggedInUser[keys] = req.body[keys];
    });

    //now this loggedInUser is a instance of the user from database so we have to save it
    await loggedInUser.save();
    // res.send(`${loggedInUser.firstName} your profile has been updated successfully `);

    //now we are sending data in a beautiful and good way i.e
    res.json({
      message: `${loggedInUser.firstName} your profile has been updated successfully `,
      data: loggedInUser, //here we have send the modified userobject along with the message
    });
  } catch (err) {
    res.status(400).send("Something went wrong " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  //first checking if the user is logedIn or not if logedIn in then comparing the current password
  try {
    //i am assuming that the user will send response like this
    // {currpassword:"pasfagaga",
    //   newpassword:"fgaafa"
    // }
    
    //checking if the currpassword and newpassword has been provided or not
    if(!req.body.currpassword || !req.body.newpassword) throw new Error("Both current and newpassword's are required");

    const userobject = req.user;
    const comparepassword = await bcrypt.compare(
      req.body.currpassword,
      userobject.password,
    );

    if (!comparepassword) throw new Error("Password is invalid");

    //now check if the new password is a strong password or not
    if (!validator.isStrongPassword(req.body.newpassword))
      throw new Error("Make a strong password");
    //save the new password in the hash form in the database
    const passwordHash = await bcrypt.hash(req.body.newpassword, 10);
    userobject.password = passwordHash;

    //important save changes to the database
    await userobject.save();


    res.send("password updated successfully");
  } catch (err) {
    res.status(400).send("something went wrong " + err.message);
  }
});

profileRouter.post(
  "/profile/upload-photo",
  userAuth,
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");

      const uploadFromBuffer = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "devtinder/profile-photos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          stream.end(req.file.buffer);
        });

      const result = await uploadFromBuffer();

      // just return the URL — don't touch the DB here
      res.json({
        message: "Photo uploaded successfully",
        photoURL: result.secure_url,
      });
    } catch (err) {
      res.status(400).send("Something went wrong " + err.message);
    }
  },
);

module.exports = profileRouter;
