const express = require("express")
const app = express();
const http = require("http"); // Import the http module
const cors = require('cors'); // Import CORS

const connectToMongo = require("./db")
const server = http.createServer(app);
const { Server } = require("socket.io");



connectToMongo();
app.use(cors());

app.use(express.json())
app.use("/api/auth" ,   require('./routes/auth'));
server.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
  })


  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3001', // Allow your front-end URL
      methods: ['GET', 'POST'], // Allow specific methods
    },
  });
  io.on('connection', (socket) => {
    
    socket.on('joinRoom', (room) => {
      socket.join(room);  // Server-side joining the room
      console.log(`User joined room: ${room}`);
    });

    socket.on('chat message', (room,msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
      });

      
    
  });
