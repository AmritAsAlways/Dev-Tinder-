const { Server } = require("socket.io");
const Chat = require("../models/chat");

// Sets up the Socket.io server on top of our existing http server.
// Handles: joining a private chat room, sending/saving messages,
// and relaying "typing"/"stopTyping" events between the two chatting users.
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    // Both users join a shared room. The room name is just their two
    // userIds sorted alphabetically and joined together — this way both
    // users compute the SAME room name independently, without needing
    // a separate "create room" step.
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);
    });

    // Fired when a user sends a chat message.
    // We save it to MongoDB first (so refreshing the page keeps history),
    // then broadcast it to everyone in the room (both users) via socket.
    socket.on("sendMessage", async ({ userId, targetUserId, text }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      try {
        // find the existing chat doc between these two users
        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        // if this is their very first message, create the chat doc
        if (!chat) {
          chat = new Chat({ participants: [userId, targetUserId], messages: [] });
        }

        // push the new message and persist it
        chat.messages.push({ senderId: userId, text });
        await chat.save();

        // grab the just-saved message so we can send its real createdAt
        // timestamp back to the frontend (needed for the "sent at" label)
        const savedMessage = chat.messages[chat.messages.length - 1];

        io.to(roomId).emit("messageReceived", {
          senderId: userId,
          text,
          createdAt: savedMessage.createdAt,
        });
      } catch (err) {
        console.log(err.message);
      }
    });

    // Fired continuously while a user is typing (frontend debounces this).
    // We relay it to the OTHER user in the room only (socket.to, not io.to,
    // so the sender doesn't see their own "typing..." indicator).
    socket.on("typing", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.to(roomId).emit("userTyping", { userId });
    });

    // Fired when the user stops typing (after a pause, or after sending).
    socket.on("stopTyping", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.to(roomId).emit("userStoppedTyping", { userId });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
