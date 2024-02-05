const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const User = require("./models/userModel");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const cors = require('cors');
dotenv.config();
connectDB();
const app = express();

app.use(cors()); // allow front api's
app.use(express.json()); // to accept json data

// app.get("/", (req, res) => {
//   res.send("API Running!");
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
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


// socket.on('offline',(_id)=>{
//   console.log('A user disconnected -- ' + _id);
//   User.updateOne({_id},{$set:{'online':false}}).then(res=>{
//     io.emit('user-offline')
//   })
// })


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



  // socket.on("typing", (room) => socket.in(room).emit("typing"));
  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  

  socket.on('disconnect', () => {
    User.updateOne({_id:userId},{$set:{'online':false}}).then(res=>{
     io.emit('user-offline')
    Object.keys(clients).forEach((room) => {
        clients[room] = clients[room].filter((client) => client !== socket);
    });

});
});
});