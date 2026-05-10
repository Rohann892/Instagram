import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://instagram-ten-murex.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

const userSocketMap = {}; // this map stores socket id corresponding to the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User connected: UserId = ${userId}, SocketId = ${socket.id}`);
  }

  // io.emit is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) {
      console.log(`User disconnected: UserId = ${userId}, SocketId = ${socket.id}`);
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
