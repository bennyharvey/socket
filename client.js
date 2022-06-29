const socket = require("socket.io-client")("http://localhost:50201");

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

socket.on("announcements", (data) => {
    console.log(data);
})