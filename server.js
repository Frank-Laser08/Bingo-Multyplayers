const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const leaderboard = {};

io.on("connection", (socket) => {
  let username = "";

  socket.on("join", (name) => {
    username = name;
    leaderboard[username] = leaderboard[username] || 0;
    io.emit("leaderboard", leaderboard);
  });

  socket.on("bingo", () => {
    if (username) {
      leaderboard[username] += 1;
      io.emit("leaderboard", leaderboard);
    }
  });

  socket.on("reset", () => {
    Object.keys(leaderboard).forEach((k) => leaderboard[k] = 0);
    io.emit("leaderboard", leaderboard);
  });

  socket.on("disconnect", () => {
    delete leaderboard[username];
    io.emit("leaderboard", leaderboard);
  });
});

app.get("/", (_, res) => res.send("Bingo Server OK"));

server.listen(3000, () => console.log("Server running on port 3000"));
