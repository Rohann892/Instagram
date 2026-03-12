import sharp from 'sharp';
import mongoose from 'mongoose';
import Post from '../models/postModel.js'
import cloudinary from '../config/cloudinary.js';
import User from '../models/userModel.js';
import Comment from '../models/commentSchema.js'
import { populate } from 'dotenv';

export const addPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.authUserId;

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image is not found'
            })
        }

        const user = await User.findById(authorId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        //  image upload 
        const optimizeImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800 })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        let cloudResponse;

        const fileUri = `data:image/jpeg;base64,${optimizeImageBuffer.toString('base64')}`;
        cloudResponse = await cloudinary.uploader.upload(fileUri);

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        })

        user.posts.push(post._id);
        await user.save();

        await post.populate({ path: 'author', select: '-password' });
        return res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message
        })
    }
};


export const getAllpost = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profileImage' })
            .populate({
                path: 'comments', sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profileImage'
                }
            })

        return res.status(201).json({
            posts,
            success: true,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message
        })
    }
}


export const getUserPost = async (req, res) => {
    try {
        const authorId = req.authUserId;

        const posts = await Post.find({ author: authorId })
            .sort({ createdAt: -1 })
            .populate({
                path: "author",
                select: "username profileImage",
            })
            .populate({
                path: "comments",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "author",
                    select: "username profileImage",
                },
            });

        return res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        console.log(error);
    }
};

export const likePost = async (req, res) => {
    try {
        const id = req.authUserId;
        const postId = req.params.id;
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post id'
            });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        // like logic
        await post.updateOne({ $addToSet: { likes: id } });
        await post.save();

        // socket.io logic for real time notification

        return res.status(200).json({
            success: true,
            message: 'Post liked'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: error.message
        })
    }
}

export const dislikePost = async (req, res) => {
    try {
        const id = req.authUserId;
        const postId = req.params.id;
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post id'
            });
        }
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        // dislike logic
        await post.updateOne({ $pull: { likes: id } });
        await post.save();

        // socket.io logic

        return res.status(201).json({
            success: true,
            message: 'Post diliked'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const addComment = async (req, res) => {
    try {
        const id = req.authUserId;
        const postId = req.params.id;

        // validate postId before querying MongoDB to avoid CastError
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post id'
            });
        }

        const post = await Post.findById(postId);
        const { text } = req.body;
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required to comment'
            })
        }

        const comment = await Comment.create({
            text,
            author: id,
            post: postId
        });

        await comment.populate({
            path: "author",
            select: "username profileImage",
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            success: true,
            message: 'Comment created Successfully',
            comment
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


export const getCommentOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId }).populate(
            "author",
            "username profileImage"
        );

        return res.status(200).json({
            success: true,
            comments,
        });
    } catch (error) {
        console.log(error);
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.authUserId;
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post id'
            });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        if (post.author.toString() !== authorId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorised to delete the post'
            })
        }

        await Post.findByIdAndDelete(postId);
        // deleting the post from the userSchema as it contain the array of post 
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();


        // deleting the associated comments with post
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            success: true,
            message: 'Post Deleted Successfully'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.authUserId;
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post id'
            });
        }
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(400).json({
                success: false,
                message: 'Post not found'
            })
        }
        const user = await User.findById(authorId)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            })
        }

        if (!user.bookmarks.includes(post._id)) {
            // add bookmark
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();

            return res.status(201).json({
                success: true,
                message: 'Post added to the bookmark'
            })
        }
        else {
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();

            return res.status(201).json({
                success: false,
                message: 'Post removed from the bookmark'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}