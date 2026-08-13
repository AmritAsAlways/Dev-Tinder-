const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Chat = require("../models/chat");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate("messages.senderId", "firstName lastName");

    if (!chat) {
      chat = new Chat({ participants: [userId, targetUserId], messages: [] });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    res.status(400).send("Something went wrong " + err.message);
  }
});

module.exports = chatRouter;