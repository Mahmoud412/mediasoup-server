// server.js
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");

const socketHandler = require("./src/socketHandler");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

socketHandler.startMediasoup().then(() => {
  console.log("mediasoup worker and router created");
});

socketHandler.initializeSocket(server);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
