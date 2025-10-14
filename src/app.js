const express = require("express");

const app = express();

app.use("/", (req, res) => {
  res.send("Hello hi bye!");
});
app.use("/test", (req, res) => {
  res.send("hi test!");
});
app.use("/hello", (req, res) => {
  res.send("Hello");
});

app.listen(7777, () => {
  console.log("The server is listening on the port 7777...");
});

