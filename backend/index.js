import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import  jwt from "jsonwebtoken";
import { authenticateToken } from './utilities.js';
import { User } from './models/user.models.js';
import { ApiError } from './utils/ApiError.js';
import {ApiResponse } from "./utils/ApiResponse.js"
import {asyncHandler} from "./utils/asyncHandler.js"
import { Note } from './models/note.models.js';

// Load environment variables from .env file
dotenv.config();

// MongoDB Connection
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME,
      });
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    }
  };
connectDB();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());


// CORS configuration
app.use(cors({
 origin: "*"
}));

// Simple route to test the server
app.get("/", (req, res) => {
    res.json({ data: "hello" });
});


//  Register user
app.post("/register" , async (req, res) => {

    const { fullName, email, password } = req.body;

    // Check if full name is provided
    if (!fullName) {
        return res.status(400).json({ error: true, message: "Full Name is required" });
    }

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }

    // Check if password is provided
    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required" });
    }

    // Continue with account creation logic (e.g., saving to the database)
    // Add more logic here as needed
    const isUser = await User.findOne({ email });

    if (isUser) {
        return res.status(400).json({ error: true, message: "User already exists" });
    }

    const user = new User({
        fullName,
        email,
        password
    });

    // Save the user to the database (add any additional logic as needed)
    await user.save();

    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '36000m' });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successful"
    });
});

// login user
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: true, message: "Email is required" });
    }
  
    if (!password) {
      return res.status(400).json({ error: true, message: "Password is required" });
    }
  
    const userInfo = await User.findOne({ email: email });
  
    if (!userInfo) {
      return res.status(400).json({ message: "User not found" });
    }
  
    if (userInfo.email == email && userInfo.password == password) {
      const user = { user: userInfo };
  
      // Log nilai ACCESS_TOKEN_SECRET
      console.log('Signing Token with Secret:', process.env.ACCESS_TOKEN_SECRET);
  
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "36000m" });
  
      return res.json({
        error: false,
        message: "Login Successful",
        email,
        accessToken,
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "Invalid Credentials",
      });
    }
  });

// get user
app.get("/get-user",authenticateToken,async(req,res) => {

    const {user} = req.user;

    const isUser = await User.findOne({_id:user._id})

    if(!isUser){
        throw new ApiError(404,"User not found")
    }

    return res.json({
        user: { 
          fullName: isUser.fullName, 
          email: isUser.email, 
          _id: isUser._id,
          createdOn: isUser.createdOn
          },
        message: ""
    });

})

// add note
app.post("/add-note",authenticateToken,async(req,res) => {

    const {title,content,tags} = req.body;
    const {user} = req.user;

    if(!title){
        throw new ApiError(401,"title is required")
    }

    if(!content){
        throw new ApiError(401,"content is required")
    }

    try {
        const note = new Note({
            title,
            content,
            tags:tags || [],
            userId: user._id,
        })

        await note.save()

        return res
        .status(200)
        .json(new ApiResponse(200,note,"Note added successfully"));
        
    } catch (error) {
        throw new ApiError(500,"Internal Server Error")
    }

})

// edit note
app.put("/edit-note/:noteId",authenticateToken,async(req,res) => {

    const noteId = req.params.noteId;
    const {title,content,tags,isPinned} = req.body
    const {user} = req.user

    if(!title && !content && !tags){
        throw new ApiError(401,"No changes provided")
    }

    try {
        const note = await Note.findOne({_id:noteId,userId:user._id})

        if(!note){
            throw new ApiError(404,"Note not found")
        }

        if(title) note.title = title;
        if(content) note.content = content;
        if(tags) note.tags = tags;
        if(isPinned) note.isPinned = isPinned;

        await note.save()

        return res
        .status(200) 
        .json(new ApiResponse(200,note,"Note edited successfully"))

    } catch (error) {
        throw new ApiError(500,"Internal Server Error")
    }


})

// get all notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;
    
    try {
      const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
      
      return res.json({
        error: false,
        notes,
        message: "All notes retrieved successfully"
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error"
      });
    }
  });

// delete note
app.delete("/delete-note/:noteId",authenticateToken,async(req,res) => {

    const noteId = req.params.noteId
    const {user} = req.user

    try {
        const note = await Note.findOne({_id:noteId,userId:user._id})

        if(!note){
            throw new ApiError(404,"Note not found")
        }

        await note.deleteOne({_id: noteId, userId: user._id})

        return res
        .status(200) 
        .json(new ApiResponse(200,"Note deleted successfully"))

    } catch (error) {
        throw new ApiError(500,"Internal Server Error")
    }

})

// update isPinned value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;
  
  try {
    const note = await Note.findOne({_id: noteId, userId: user._id});
    
    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }
    
    if(isPinned !== undefined) note.isPinned = isPinned;
    
    await note.save();
    
    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
    
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// search notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      error: true,
      message: "Search query is required"
    });
  }
  
  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { content: { $regex: new RegExp(query, 'i') } },
      ],
    });
    
    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully"
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error"
    });
  }
});

// Start the server
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

export {app};
