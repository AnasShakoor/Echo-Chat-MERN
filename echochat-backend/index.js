const express = require("express");
const app = express();
const cors = require('cors'); // Import CORS
const connectToMongo = require("./db");

const http = require("http"); // Import the http module
const server = http.createServer(app);
const { Server } = require("socket.io");

connectToMongo();
app.use(cors());

app.use(express.json());
app.use("/api/auth", require('./routes/auth'));
app.use("/api/chat", require('./routes/Chat'));

server.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001', // Allow your front-end URL
    methods: ['GET', 'POST'], // Allow specific methods
  },
});


let onlineUsers = {};
io.on('connection', (socket) => {


  socket.on('Update read status', (roomId) => {
    socket.to(roomId).emit('Update read status 2');
  });


  socket.on('joinRoom', ({roomId,userId}) => {
    socket.join(roomId); 

    onlineUsers[userId] = socket.id;
    console.log(userId);
    console.log(socket.id)
  });

  socket.on('send_message', ({ msg, roomId , senderId,receiverId}) => {
    console.log('message: ' + msg);

    // if(onlineUsers[receiverId]){

      socket.to(roomId).emit('receive_message', {msg:msg, sender : senderId, receiverId: receiverId});
    // }else{
      // io.to(roomId).emit('receive_message', "he is not online bro");

    // }  
    console.log("sender" + senderId)
    console.log(onlineUsers)
    console.log("receiver" + receiverId)
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId]; 
        break;
      }
    }
  });
});
