import { Server } from "socket.io";

let io:Server;
function initSocket(server: any) {
   io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  return io;
}

export default initSocket;


export { io };