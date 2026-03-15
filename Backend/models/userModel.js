import mongoose from "mongoose";

const userModel = new mongoose.Schema({

    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: ''
    },

    bio: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        enum: ["male", "female"]
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    }]
}, { timestamps: true });

const User = mongoose.model('User', userModel);
export default User;