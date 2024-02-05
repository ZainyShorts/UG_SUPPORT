const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/userModel");
const { authUser, allUsers, editProfile, registerUser, changeStatus, userById} = require('./controllers/userControllers');
const {accessChat,fetchChats} = require('./controllers/chatControllers');
const { allMessages,sendMessage} = require('./controllers/messageControllers');
const { protect } = require("./middleware/authMiddleware");
const cors = require('cors');


connectDB();
const app = express();
app.use(cors()); // allow front api's
app.use(express.json()); // to accept json data


//USER ROUTES LIST
  app.post("/api/user/login", authUser);
  app.get("/api/user/",protect, allUsers);
  app.patch("/api/user/edit",protect,editProfile);
  app.post("/api/user/",registerUser)
  app.get("/api/user/status",protect,changeStatus)
  app.get("/api/user/userByToken",protect,userById)
//CHAT ROUTES LIST
  app.post("/api/chat/",protect, accessChat)
  app.get("/api/chat/",protect,  fetchChats)
//MESSAGES ROUTES LIST
  app.get("/:chatId",protect, allMessages);
  app.post("/",protect, sendMessage);



  app.get("/", (req, res) => {
    res.send("API is running..");
  });




const PORT = 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);
const clients = {};
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  const userId = socket.handshake.auth.token
  
  User.updateOne({_id:userId},{$set:{'online':true}}).then(re=>{
    io.emit('user-online')
  })


socket.on('join chat', (room) => {
    socket.join(room);
    if (!clients[room]) {
        clients[room] = [];
    }
    clients[room].push(socket);
});

socket.on("new message", (newMessageRecieved,room) => {
    io.to(room).emit('new message', newMessageRecieved,userId);
  });
  
  socket.on('disconnect', () => {
    User.updateOne({_id:userId},{$set:{'online':false}}).then(res=>{
     io.emit('user-offline')
});
});
});