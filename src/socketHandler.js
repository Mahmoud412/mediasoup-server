const { Server } = require("socket.io");
const mediasoup = require("mediasoup");
const config = require("./config");

const io = new Server();
const rooms = new Map();
const viewers = new Set();
let worker, broadcaster, router;

async function startMediasoup() {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: config.mediaCodecs,
  });
}

function initializeSocket(server) {
  io.attach(server);

  io.on("connection", (socket) => {
    console.log(
      `A user connected: ${socket.id} from ${socket.handshake.address}`
    );

    socket.on("join", (data) => {
      const { role, roomId } = data;
      joinRoom(socket, roomId);
      if (role === "broadcaster") {
        handleBroadcaster(socket);
      } else if (role === "viewer") {
        handleViewer(socket);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
      handleDisconnect(socket);
    });
  });

  io.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error);
  });
}

function joinRoom(socket, roomId) {
  socket.join(roomId);
  const room = rooms.get(roomId) || { broadcaster: null, viewers: new Set() };
  rooms.set(roomId, room);

  if (!room.broadcaster) {
    room.broadcaster = socket.id;
    broadcaster = socket.id;
  } else {
    room.viewers.add(socket);
    viewers.add(socket);
  }
}

function handleDisconnect(socket) {
  if (socket.id === broadcaster) {
    // Broadcaster disconnected, notify viewers
    broadcaster = null;
    notifyViewers("broadcasterDisconnected");
    viewers.clear();
  } else {
    // Viewer disconnected
    viewers.delete(socket);
  }
}

async function handleBroadcaster(socket) {
  console.log("User is a broadcaster");
  broadcaster = socket.id;

  // Create a new WebRtcTransport for the broadcaster
  const transport = await createWebRtcTransport(socket);

  // Send the transport parameters to the broadcaster
  socket.emit("transportParameters", getTransportParameters(transport));

  // Handle incoming ICE candidates from the broadcaster
  socket.on("iceCandidate", (data) => {
    // Send the received ICE candidate to the other peer
    const targetSocket =
      broadcaster === socket.id ? viewers.values().next().value : broadcaster;
    io.to(targetSocket).emit("iceCandidate", data);
  });

  // Wait for 'dtlsstatechange' event with 'connected' state
  await waitForDtlsConnected(transport);

  // Now that DTLS is connected, send an offer to viewers
  const { params } = transport;
  socket.emit("offer", {
    transportId: params.id,
    offer: await transport.createOffer(),
  });

  // Broadcast the new transport to viewers
  notifyViewers("newTransport", { id: transport.id });
}

async function handleViewer(socket) {
  console.log("User is a viewer");

  // Notify viewer when the broadcaster disconnects
  socket.on("broadcasterDisconnected", () => {
    console.log("Broadcaster disconnected");
    viewers.delete(socket);
    socket.emit("broadcasterDisconnected");
  });

  // Handle incoming ICE candidates from the viewer
  socket.on("iceCandidate", (data) => {
    // Forward the received ICE candidate to the broadcaster
    if (broadcaster) {
      io.to(broadcaster).emit("iceCandidate", {
        socketId: socket.id,
        candidate: data.candidate,
      });
    }
  });

  // Handle viewer's request to join the room
  socket.on("joinRoom", async (roomId) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("roomNotFound");
      return;
    }

    // Create a new WebRtcTransport for the viewer
    const transport = await createWebRtcTransport(socket);

    // Add the viewer's transport to the room
    room.viewers.add(socket);
    room.viewerTransports.set(socket.id, transport);

    // Send the transport parameters to the viewer
    socket.emit("transportParameters", getTransportParameters(transport));

    // Wait for 'dtlsstatechange' event with 'connected' state
    await waitForDtlsConnected(transport);

    // Now that DTLS is connected, notify the broadcaster
    if (broadcaster) {
      io.to(broadcaster).emit("viewerConnected", { socketId: socket.id });
    }
  });
}

function notifyViewers(event, data) {
  viewers.forEach((viewer) => {
    viewer.emit(event, data);
  });
}

async function createWebRtcTransport(socket) {
  return await router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp: null }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });
}

function getTransportParameters(transport) {
  const { id, iceParameters, iceCandidates, dtlsParameters } = transport;
  return { id, iceParameters, iceCandidates, dtlsParameters };
}

async function waitForDtlsConnected(transport) {
  return await new Promise((resolve) => {
    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "connected") {
        resolve();
      }
    });
  });
}

module.exports = {
  io,
  initializeSocket,
  startMediasoup,
};
