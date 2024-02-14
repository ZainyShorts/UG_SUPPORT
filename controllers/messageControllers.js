const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const fs  = require('fs');
const path = require("path");
const cloudinary = require('cloudinary').v2;


var newMessage;              




const allMessages = asyncHandler(async (req, res) => {

    await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat").then(async (results) => {
        results = await User.populate(results, {
          path: "chat.users",
          select: "name pic email",
        });
        res.json(results);
      }).catch((e)=>{
        res.status(500);
        throw new Error(e.message);
      })
    });
 

const sendMessage = asyncHandler(async (req, res) => {
  cloudinary.config({
    cloud_name: 'dklqbx5k0',
    api_key: '586219556714458',
    api_secret: 'JY7qKHk1QeMN5FqaW4lPf9N3k1E'
  });

  const {type, content, chatId ,date} = req.body;
    
  if (!content || !chatId || !type || !date) {
    return res.status(400);
  }

  
  if(type == 'VOICE')
  {
    const random = Math.random()
    const file = `${Date.now()}${random}_.mp3`
    let filePath = `/files/${file}`;
    let buffer = Buffer.from(content.slice(22),"base64")
    fs.writeFileSync(path.join(__dirname,filePath),buffer)
    const mp3FilePath = path.join(`${__dirname}/files`,file);
   await cloudinary.uploader.upload(mp3FilePath, ({ resource_type: 'raw' }), (error, result) => {
      if (error) {
        newMessage = {
          sender: req.user._id,
          content: 'corrupted audio',
          chat: chatId,
          time:date,
          type:type
          };
      } else {
        console.log(result.secure_url)
         newMessage = {
          sender: req.user._id,
          content: result.secure_url,
          chat: chatId,
          time:date,
          type:type
          };
      }
      fs.unlink(path.join(__dirname, filePath), (error) => {
        if (error) {
            console.error('Error deleting file:', error);
        } else {
            console.log('File deleted successfully');
        }
    });
    });
         
  }
 else{
    newMessage = {
     sender: req.user._id,
     content: content,
     chat: chatId,
     time:date,
     type:type
}
 }
  
  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic")
    .execPopulate();
    message = await message.populate("chat")
    .execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteMessage = asyncHandler(async (req, res) => {

  try {
    await Message.findByIdAndDelete({_id:req.params.msgId });
    res.status(200).json({'success':true});
  } catch (error) {
    res.status(500).json({'success':true});
  }
});
const lastMessage = asyncHandler(async (req, res) => {

  try {
    await Message.findByIdAndUpdate({_id:req.params.msgId },{$set:{'readBy':true}});
    res.status(200).json({'success':true});
  } catch (error) {
    res.status(500).json({'success':true});
  }
});
const clearMessages = asyncHandler(async (req, res) => {

  try {
    await Message.deleteMany({});
    res.status(200).json({'success':true});
  } catch (error) {
    res.status(500).json({'success':true});
  }
});

module.exports = {clearMessages, lastMessage, allMessages, sendMessage, deleteMessage };
