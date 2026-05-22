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

  // ─── WebRTC Calling Signaling ───────────────────────────────────────────────

  // Caller initiates a call → notify receiver
  socket.on("initiateCall", ({ receiverId, callerId, callerName, callerAvatar, callType }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", { callerId, callerName, callerAvatar, callType });
    }
  });

  // Receiver accepts call → notify caller
  socket.on("callAccepted", ({ callerId, answer }) => {
    const callerSocketId = userSocketMap[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", { answer });
    }
  });

  // Receiver rejects call → notify caller
  socket.on("callRejected", ({ callerId }) => {
    const callerSocketId = userSocketMap[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  // Forward SDP offer from caller to receiver
  socket.on("webrtc-offer", ({ receiverId, offer }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc-offer", { offer, callerId: userId });
    }
  });

  // Forward SDP answer from receiver to caller
  socket.on("webrtc-answer", ({ callerId, answer }) => {
    const callerSocketId = userSocketMap[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("webrtc-answer", { answer });
    }
  });

  // Forward ICE candidates between peers
  socket.on("ice-candidate", ({ targetId, candidate }) => {
    const targetSocketId = userSocketMap[targetId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
    }
  });

  // Either party ends the call → notify the other
  socket.on("endCall", ({ targetId }) => {
    const targetSocketId = userSocketMap[targetId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });

  // ────────────────────────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    if (userId) {
      console.log(`User disconnected: UserId = ${userId}, SocketId = ${socket.id}`);
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };

