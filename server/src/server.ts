import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import dbConnect from "./config/dbConnect";
import app from "./app";  // Assuming `app` is your Express app
import http from "http";
import initSocket from "./config/socketConfig";

// Create an HTTP server using Express
const server = http.createServer(app);

// Initialize socket.io with the HTTP server
const io = initSocket(server);

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception occurred! Shutting down...");
  process.exit(1);
});

// Connect to the database
dbConnect();

server.listen(process.env.PORT, () => {
  console.log(
    `Server has started on PORT ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// WebSocket 

io.on('connection', (socket) => {
  // console.log('New client connected.......:', socket.rooms);
  console.log('New client connected:', socket.id);

  // Join a specific channel
  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`Client ${socket.id} joined channel ${channelId}`);
  });

  // Leave the channel when the client disconnects or leaves
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    console.log(`Client ${socket.id} left channel ${channelId}`);
  });

  // Handle content updates
  socket.on('send-content', ({ channelId, content }) => {
    console.log(`Broadcasting content to channel ${channelId}:`, content);
    socket.to(channelId).emit('receive-content', { channelId, content });
  });

  socket.on('get-content', (channelId) => {
    // Logic to load and send the initial content for the channel
    const initialContent = ''; // Replace with actual content loading logic
    socket.emit('load-content', initialContent);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
