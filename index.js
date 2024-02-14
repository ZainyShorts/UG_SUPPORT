const express = require("express");
const connectDB = require("./config/db");
const { resetPassword, authUser, allUsers, editProfile, registerUser, changeStatus, userById, isOnline} = require('./controllers/userControllers');
const {accessChat,fetchChats} = require('./controllers/chatControllers');
const { allMessages,sendMessage,deleteMessage,lastMessage,clearMessages} = require('./controllers/messageControllers');
const { protect } = require("./middleware/authMiddleware");
const bodyParser = require('body-parser');
const cors = require('cors');

connectDB();
const app = express();
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true }));
app.use(cors()); // allow front api's
app.use(express.json()); // to accept json data


//USER ROUTES LIST
  app.post("/api/user/login", authUser);
  app.get("/api/user/",protect, allUsers);
  app.patch("/api/user/edit",protect,editProfile);
  app.post("/api/user/",registerUser)
  app.get("/api/user/status",protect,changeStatus)
  app.get("/isOnline",protect,isOnline)
  app.get("/api/user/userByToken",protect,userById)
  app.post("/api/user/reset",resetPassword)
//CHAT ROUTES LIST
  app.post("/api/chat/",protect, accessChat)
  app.get("/api/chat/",protect,  fetchChats)
//MESSAGES ROUTES LIST
  app.get("/api/message/:chatId",protect, allMessages);
  app.get("/api/message/readBy/:msgId",lastMessage);
  app.post("/api/message",protect, sendMessage);
  app.delete("/del/:msgId",protect, deleteMessage);
  app.delete("/api/message/deleteAll",clearMessages)



  app.get("/", (req, res) => {
    res.send("API is running..");
  });




const PORT = 5000;

app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);
// const clients = {};
// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "http://localhost:3000",
//     // credentials: true,
//   },
// });

// io.on("connection", (socket) => {
//   console.log("Connected to socket.io");
//   const userId = socket.handshake.auth.token
  
//   User.updateOne({_id:userId},{$set:{'online':true}}).then(re=>{
//     io.emit('user-online')
//   })


// socket.on('join chat', (room) => {
//     socket.join(room);
//     if (!clients[room]) {
//         clients[room] = [];
//     }
//     clients[room].push(socket);
// });

// socket.on("new message", (newMessageRecieved,room) => {
//     io.to(room).emit('new message', newMessageRecieved,userId);
//   });
  
//   socket.on('disconnect', () => {
//     User.updateOne({_id:userId},{$set:{'online':false}}).then(res=>{
//      io.emit('user-offline')
// });
// });
// });