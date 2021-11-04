const socket = io('/');
const screenVideo = document.getElementById('screen-video');

var peer = new Peer();

peer.on('call', (call) => {
  call.answer();
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
});

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

socket.on('close-room', () => {
  screenVideo.remove();
  const h1 = document.createElement("H1");
  const h1Text = document.createTextNode("Share Closed!");
  h1.appendChild(h1Text);
  document.body.append(h1);
});

const addVideoStream = (video, stream) => {
  video.id = 'screen-01';
  video.srcObject = stream;
  video.muted = true;  
  video.play();
  requestFullScreen(document.body);
  screenVideo.append(video);
};

function requestFullScreen(element) {
  // Supports most browsers and their versions.
  var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

  if (requestMethod) { // Native full screen.
      requestMethod.call(element);
  } else if (typeof window.ActiveXObject !== 'undefined') { // Older IE.
      var wscript = new ActiveXObject('WScript.Shell');
      if (wscript !== null) {
          wscript.SendKeys('{F11}');
      }
  }
}

window.addEventListener('beforeunload', function() {
  socket.close();
});