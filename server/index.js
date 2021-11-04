require('dotenv').config();
const uuid = require('uuid');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const server = http.Server(app);
const amqplib = require('amqplib');
const io = socketIO(server);

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './public')));

app.get('/', async function(req, res) {
  try {
    const roomId = uuid.v4();
    const conn = await amqplib.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`, 'heartbeat=60');
    const ch = await conn.createChannel();
    await ch.assertQueue('room', {durable: true});
    ch.sendToQueue('room', Buffer.from(roomId));
    res.render('cast', { roomId });
    setTimeout(function() {
      ch.close();
      conn.close();
    }, 500);
  } catch (e) {
    throw new Error(e.message)
  }
});

app.get('/mirror/:id', (req, res) => {
  res.render('mirror', { roomId: req.params.id });
});

server.listen(3000, () => {
  console.log('run on port 3000');
});

io.on('connection', socket => {
  let globalRoomId = '';
  socket.on('join-room', (roomId, userId) => {
    globalRoomId = roomId;
    socket.join(globalRoomId);
    socket.to(globalRoomId).emit('user-connected', userId);
  });
  socket.on('disconnect', () => {
    socket.to(globalRoomId).emit('close-room');
  });
});
