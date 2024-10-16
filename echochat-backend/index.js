const express = require("express");
const app = express();
const cors = require('cors'); // Import CORS
const connectToMongo = require("./db");
const bodyParser = require('body-parser');

const http = require("http"); // Import the http module
const server = http.createServer(app);
const { Server } = require("socket.io");

connectToMongo();
app.use(cors());

// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use("/api/auth", require('./routes/auth'));
app.use("/api/chat", require('./routes/Chat'));
app.use("/api/upload", require('./routes/upload'));
app.use('/api/files', express.static('uploads'));


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


  socket.on('Update read status', ({ roomId, sender, receiverId }) => {
    if (sender == receiverId) {

      io.to(roomId).emit('Update read status 2');
    } else {

      socket.to(roomId).emit('Update read status 2');
    }
  });


  socket.on('joinRoom', ({ roomId, userId }) => {
    socket.join(roomId);
    onlineUsers[userId] = socket.id;
    console.log(userId);
    console.log(socket.id)
  });

  socket.on('send_message', ({ msg, roomId, senderId, receiverId,fileUrl}) => {

    console.log(fileUrl)
    // if(onlineUsers[receiverId]){
    if (senderId == receiverId) {

      io.to(roomId).emit('receive_message', { msg: msg, sender: senderId, receiverId: receiverId});
    } else {

      socket.to(roomId).emit('receive_message', { msg: msg, sender: senderId, receiverId: receiverId,fileUrl });
    }
    io.emit('update_unread_count', { receiverId: receiverId, senderId: senderId });
    console.log(receiverId);
    // }else{
    // io.to(roomId).emit('receive_message', "he is not online bro");

    // // }  
    // console.log("sender" + senderId)
    // console.log(onlineUsers)
    // console.log("receiver" + receiverId)
  });
  io.emit('update_unread_count', { senderId: 123 })

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
