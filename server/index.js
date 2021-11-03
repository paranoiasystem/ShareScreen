const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { ExpressPeerServer } = require('peer');
const uuid = require('uuid');
const peerServer = ExpressPeerServer(http);
const path = require('path');

app.set('views', path.join(__dirname, './views'));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "./public")));
app.use("/peerjs", peerServer);

app.get('/', function(req, res) {
  res.render("cast", { roomId: uuid.v4(), userId: uuid.v4() });
});

app.get("/mirror/:id", (req, res) => {
  res.render("mirror", { roomId: req.params.id, userId: uuid.v4() });
});

io.on("connection", socket => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
  });
});

http.listen(3000, function() {
   console.log('listening on *:3000');
});