const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

async function createChat(yourId,userId)
{
  var isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: yourId } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })

  if (isChat.length > 0) {
    return;
  } else {
    var chatData = {
      users: [yourId, userId],
    };

    try {
      await Chat.create(chatData);
      return;
    } catch (error) {
      return;
    }
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic,isAdmin } = req.body;
  if (!name || !email || !password || !pic ) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }


  const user = await User.create({
    name,
    email,
    password,
    pic,
    isAdmin:isAdmin?true:false
  });
  if(isAdmin!=true || !isAdmin)
  {
    const admins = await User.find({isAdmin:true});
    if(admins)
    {
    admins.forEach(async (element)=> {
        var chatData = {
          users: [user._id, element._id],
        };
        await Chat.create(chatData);
      });
    }
  }
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
    if(isAdmin == true)
    {
      const u = await User.find();
    for(let i=0;i<u.length;i++)
    {
      createChat(user._id,u[i]._id)
    }
    }
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const editProfile = asyncHandler(async (req, res) => {
    try{
      let user = await User.findOne({_id:req.user._id});
      if(!user)
      {
        res.status(401).send({error:'User not found'});
      }
      await User.findByIdAndUpdate({_id:req.user._id},{
        name:req.body.name
      });
      
      user = await User.findOne({_id:req.user._id});

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });
    }catch(e)
    {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
});

const userById = asyncHandler(async (req, res) => {
    try{
      
      const user = await User.findOne({_id:req.user._id})
      if(!user)
      {
        res.status(400).send({error:'User not found'})
      }
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });

    }catch(e)
    {
      res.status(500).send({error:'server error'});
    }
});

const changeStatus = asyncHandler(async(req,res)=>{
  try
  {
    await User.findByIdAndUpdate({_id:req.user._id},{$set:{'online':false}})
    res.status(200).send(true);
  }
  catch(e)
  {
    res.status(500).send(false);
  }
})

const isOnline = asyncHandler(async(req,res)=>{
  try
  {
    const user = await User.findOne({_id:req.user._id})
    res.status(200).send({success:true,isOnline:user.online});
  }
  catch(e)
  {
    res.status(500).send(false);
  }
})
const resetPassword = asyncHandler(async(req,res)=>{
  const {password,confirmPassword,_id} = req.body;  
 
  try
  {
    if(!password || !confirmPassword)
    {
      res.status(400).json({'success':false,error:"Please fill empty fields"})
    }
    if(password != confirmPassword )
    {
      res.status(400).json({'success':false,error:"Password not match"})
    }
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);
    console.log(newPassword)
    const user = await User.findOne({_id})
    console.log(_id)
    console.log(user._id)
    if(user._id == _id){
      await User.updateOne({_id},{$set:{password:newPassword}})
      res.status(200).send({success:true});
    }
    else
    {
      res.status(401).send({success:false,error:'User not found'});
    }
  }
  catch(e)
  {
    res.status(500).send({success:false});
  }
})





module.exports = { resetPassword, allUsers, registerUser, authUser,editProfile,userById,changeStatus,isOnline };
