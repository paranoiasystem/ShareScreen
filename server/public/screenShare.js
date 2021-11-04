const socket = io('/');
const startScreenShareBtn = document.getElementById('startScreenShare');
const myVideo = document.createElement('video');

var peer = new Peer();

startScreenShareBtn.addEventListener('click', () => {
  navigator.mediaDevices
  .getDisplayMedia({
    video: {
      width: { ideal: 4096 },
      height: { ideal: 2160 },
      cursor: 'always',
      frameRate: 60
    },
    audio: false
  })
  .then((stream) => {
    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });
});

const connectToNewUser = (userId, stream) => {
  peer.call(userId, stream);
};

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

const inviteButton = document.querySelector('#inviteButton');
inviteButton.addEventListener('click', (e) => {
  prompt(
    'Copy this link and send it to people you want to meet with',
    `https://${window.location.hostname}/mirror/${ROOM_ID}`
  );
});

window.addEventListener('beforeunload', function() {
  socket.close();
});