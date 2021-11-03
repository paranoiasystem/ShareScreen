const uuid = require('uuid');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const server = http.Server(app);
const io = socketIO(server);

app.set('views', path.join(__dirname, './views'));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "./public")));

app.get('/', function(req, res) {
  res.render("cast", { roomId: uuid.v4(), userId: uuid.v4() });
});

app.get("/mirror/:id", (req, res) => {
  res.render("mirror", { roomId: req.params.id, userId: uuid.v4() });
});

server.listen(3000, () => {
  console.log('run on port 3000');
});

io.on("connection", socket => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
  });
});
