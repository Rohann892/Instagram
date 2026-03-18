import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getDataUri from "../config/dataUri.js";
import cloudinary from "../config/cloudinary.js";
import Post from '../models/postModel.js'

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                success: false,
                message: 'All field are required'
            })
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                success: false,
                message: 'This email already exists, try with different one'
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await User.create({
            username,
            email,
            password: hashedPassword,
        })

        return res.status(201).json({
            success: true,
            message: 'Account created successfully'
        })
    } catch (error) {
        console.log(res);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email or Password is missing'
            })
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User does not exits. Please register'
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            })
        }

        const tokenData = {
            userId: user._id
        }

        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is missing");
        }

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        const populatedPost = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (!post) return null;
                if (post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        )

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPost,
            bookmarks: user.bookmarks
        }
        return res.status(200).cookie('token', token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None' }).json({
            success: true,
            message: `welcome back ${user.username}`,
            user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}



export const logout = (_, res) => {
    try {
        return res.status(200).cookie('token', "", { maxAge: 0 }).json({
            success: true,
            message: 'Logged out Successfully'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            messsage: error.message,
        })
    }
}


export const getMyProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id)
            .select("-password")
            .populate({
                path: "posts",
                options: { sort: { createdAt: -1 } }
            })
            .populate("bookmarks");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }
        console.log(user);
        return res.status(200).json({
            success: true,
            user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


export const editProfile = async (req, res) => {
    try {
        const id = req.authUserId;
        const { bio, gender } = req.body;
        const profileImage = req.file;
        let cloudResponse;

        if (profileImage) {
            const fileUri = getDataUri(profileImage);
            cloudResponse = await cloudinary.uploader.upload(fileUri)
        }

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profileImage) user.profileImage = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            success: true,
            user,
            messsage: 'Profile updated successfully'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const getSuggestedUser = async (req, res) => {
    try {
        const id = req.authUserId;
        const suggestedUser = await User.find({ _id: { $ne: id } }).select("-password");
        if (!suggestedUser) {
            return res.status(402).json({
                success: false,
                message: 'Currently do not have suggested user'
            })
        }

        return res.status(200).json({
            success: true,
            users: suggestedUser,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const followOrUnfollow = async (req, res) => {
    try {
        const loggedInUserId = req.authUserId;
        const userId = req.params.id;

        if (loggedInUserId === userId) {
            return res.status(404).json({
                success: false,
                message: 'You cannot follow/unfollow yourself'
            })
        }

        const loggedInUser = await User.findById(loggedInUserId);
        const user = await User.findById(userId);
        if (!loggedInUser || !user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        if (!user.followers.includes(loggedInUserId)) {
            await Promise.all([
                user.updateOne({ $push: { followers: loggedInUserId } }),
                loggedInUser.updateOne({ $push: { following: userId } })
            ]);

            return res.status(200).json({
                success: true,
                message: `${loggedInUser.username} just followed ${user.username}`
            })
        }
        else {
            await Promise.all([
                user.updateOne({ $pull: { followers: loggedInUserId } }),
                loggedInUser.updateOne({ $pull: { following: userId } })
            ]);

            return res.status(200).json({
                success: true,
                message: `${loggedInUser.username} unfollowed to ${user.username}`
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}