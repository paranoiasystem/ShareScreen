const socket = io("/");
const startScreenShareBtn = document.getElementById("startScreenShare");
const myVideo = document.createElement("video");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

startScreenShareBtn.addEventListener("click", () => {
  navigator.mediaDevices
  .getDisplayMedia({
    video: {
      width: { ideal: 4096 },
      height: { ideal: 2160 },
      cursor: "always",
      frameRate: 60
    },
    audio: false
  })
  .then((stream) => {
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });
});

const connectToNewUser = (userId, stream) => {
  peer.call(userId, stream);
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, USER_ID);
});

const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    `${window.location.hostname}/mirror/${ROOM_ID}`
  );
});

window.addEventListener("beforeunload", function() {
  console.log("Close web socket");
  socket.close();
});