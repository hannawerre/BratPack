import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET"],
      credentials: true
  }
});

// Read in the "class" to store all our data on the server side
// If you need to change how data is handled, check the Data.js file!

import { Data } from "./Data.js";

//
import { sockets } from "./sockets.js";

let data = new Data();

io.on('connection', function (socket) {
  sockets(this, socket, data);
  // Print all active socket connections
  // console.log("Active socket connections:");
  // console.log(Array.from(io.sockets.sockets.keys()));
});

// io.on("disconnect", () => {
//   console.log(`Socket disconnected: ${socket.id}`);
//   console.log("Remaining active socket connections:");
//   console.log(Array.from(io.sockets.sockets.keys()));
// });

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, function() {
    console.log("Socket.io server running on http://localhost:" + PORT);
});
