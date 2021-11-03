const socket = io("/");
const screenVideo = document.getElementById("screen-video");

var peer = new Peer();

peer.on("call", (call) => {
  call.answer();
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, USER_ID);
});

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.muted = true;  
    video.play(); 
    document.documentElement.requestFullscreen();
    screenVideo.append(video);
};

window.addEventListener("beforeunload", function() {
  console.log("Close web socket");
  socket.close();
});