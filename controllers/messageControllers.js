const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
function result()
{
  const currentDate = new Date();

// Options for formatting the time
const timeOptions = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
};

// Options for formatting the date
const dateOptions = {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric'
};

// Generate the formatted time and date strings
const formattedTime = currentDate.toLocaleString('en-US', timeOptions);
const formattedDate = currentDate.toLocaleString('en-US', dateOptions);

// Combine the time and date strings in the desired order
const result = `${formattedTime} ${formattedDate}`;
return result;
}

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
  const {type, content, chatId ,date} = req.body;

  
  if (!content || !chatId || !type) {
    return res.status(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    time:date,
    type:type
  };


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
