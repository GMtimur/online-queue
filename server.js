const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let queue = []; // Очередь пользователей

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("queueUpdated", queue);

  socket.on("joinQueue", (user) => {
    if (!queue.includes(user)) {
      queue.push(user);
      io.emit("queueUpdated", queue);
    }
  });

  socket.on("nextInQueue", () => {
    if (queue.length > 0) {
      queue.shift();
      io.emit("queueUpdated", queue);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
