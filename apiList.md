## DevTinder APIs

authRouter
-POST /signup
-POST /login
-POST /logout

profileRouter
-GET  /profile/view
-POST  /profile/edit
-POST  /profile/password //forget password API 

connectionRequestRouter
<!-- -POST /request/send/interested/:userId
-POST /request/send/ignored/:userId -->  these two can be merged to make the route like this POST /request/send/:status/:userId


<!-- -POST /request/review/accepted/:requestId
-POST /request/review/rejected/:requestId --> these two can be merged to make the route like this POST/request/review/:status/:userId

userRouter
-GET /user/requests/received
-GET /user/connections
-GET /user/feed --gets the user profile of other users on platform

Status : ignored,interested,accepted,rejected