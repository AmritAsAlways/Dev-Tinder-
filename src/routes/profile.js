const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validators");
const bcrypt = require("bcrypt");
const validator = require("validator");
//change the path and import all the necessary methods and library needed to run all those routes
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

// the original stock avatar we used to point photoURL at directly. Now we
// upload it to our own Cloudinary account instead of hotlinking it forever.
const DEFAULT_PHOTO_SOURCE_URL =
  "https://i.pinimg.com/originals/15/0f/a8/150fa8800b0a0d5633abc1d1c4db3d87.jpg?nii=t";
// fixed public_id so every call reuses/overwrites the SAME Cloudinary asset
// instead of creating a new upload each time someone clicks the button
const DEFAULT_PHOTO_PUBLIC_ID = "devtinder/profile-photos/default-avatar";

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
    validateEditProfileData(req);

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

profileRouter.post("/profile/upload-photo", userAuth, (req, res) => {
  // IMPORTANT: upload.single("photo") is called manually here instead of
  // being passed directly as middleware (i.e. NOT
  // `upload.single("photo"), async (req, res) => {...}`).
  //
  // Why: when Multer's fileFilter rejects a file (wrong type) or a file
  // exceeds the size limit, it reports that failure by calling
  // `cb(new Error(...))`. If upload.single() is registered as normal
  // middleware, Express routes that error to its own DEFAULT error
  // handler — which has nothing to do with our app's error format, and
  // sends back a raw HTML stack-trace page instead of clean JSON/text.
  // That's exactly what produced the broken "<!DOCTYPE html>..." response
  // you were seeing in the frontend.
  //
  // Calling upload.single("photo")(req, res, callback) directly lets US
  // receive that error in a plain callback, so we can respond with the
  // same clean, short error message every other route in this file uses.
  upload.single("photo")(req, res, async (multerErr) => {
    if (multerErr) {
      // covers both: fileFilter rejections (e.g. "Only image files are
      // allowed") AND Multer's own limit errors (e.g. file over 5MB)
      return res.status(400).send("Something went wrong " + multerErr.message);
    }

    try {
      if (!req.file) throw new Error("No file uploaded");
      console.log("received file:", req.file.originalname, req.file.mimetype, req.file.size);

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
  });
});

profileRouter.get("/profile/default-photo", userAuth, async (req, res) => {
  try {
    // Look the asset up first — if it's already on Cloudinary from a
    // previous call, reuse that URL instead of re-uploading.
    let secureUrl;
    try {
      const existing = await cloudinary.api.resource(DEFAULT_PHOTO_PUBLIC_ID);
      secureUrl = existing.secure_url;
    } catch (lookupErr) {
      // not found yet — upload the stock photo once, under the fixed
      // public_id, so every future call finds it via the lookup above
      const uploaded = await cloudinary.uploader.upload(DEFAULT_PHOTO_SOURCE_URL, {
        public_id: DEFAULT_PHOTO_PUBLIC_ID,
        folder: undefined, // public_id already includes the folder path
        overwrite: false,
      });
      secureUrl = uploaded.secure_url;
    }

    res.json({
      message: "Default photo ready",
      photoURL: secureUrl,
    });
  } catch (err) {
    // Cloudinary's SDK doesn't always reject with a real Error instance —
    // sometimes it's a plain object shaped like { error: { message, http_code } }.
    // Checking both shapes avoids printing "Something went wrong undefined".
    const message =
      err?.message || err?.error?.message || "Failed to load the default photo";
    res.status(400).send("Something went wrong " + message);
  }
});

module.exports = profileRouter;
