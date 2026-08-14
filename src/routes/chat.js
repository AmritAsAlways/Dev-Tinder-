const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Chat = require("../models/chat");

// GET /chat/:targetUserId
// Fetches (or creates) the chat document between the logged-in user and
// the target user, and also returns the target user's basic profile info
// (name + photo) so the frontend can show who you're chatting with.
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    // find an existing chat between these two users
    // populate messages.senderId -> so we know who sent each message
    // populate participants -> so we can pull out the OTHER user's profile
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    })
      .populate("messages.senderId", "firstName lastName")
      .populate("participants", "firstName lastName photoURL");

    // if no chat exists yet, create an empty one so the frontend always
    // gets a consistent response shape (messages: [], targetUser: {...})
    if (!chat) {
      chat = new Chat({ participants: [userId, targetUserId], messages: [] });
      await chat.save();
      // re-populate participants after creating, since a fresh doc has
      // raw ObjectIds until populated
      await chat.populate("participants", "firstName lastName photoURL");
    }

    // participants is an array of 2 users — pick out whichever one is NOT
    // the logged-in user, that's who we're chatting with
    const targetUser = chat.participants.find(
      (p) => p._id.toString() !== userId.toString(),
    );

    res.json({ messages: chat.messages, targetUser });
  } catch (err) {
    res.status(400).send("Something went wrong " + err.message);
  }
});

module.exports = chatRouter;
