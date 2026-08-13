const { Server } = require("socket.io");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    // both users join a shared room, room name = sorted userIds joined together
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ userId, targetUserId, text }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      try {
        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({ participants: [userId, targetUserId], messages: [] });
        }

        chat.messages.push({ senderId: userId, text });
        await chat.save();

        io.to(roomId).emit("messageReceived", { senderId: userId, text });
      } catch (err) {
        console.log(err.message);
      }
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;