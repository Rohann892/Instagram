import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: true,
    },
    author: {
        author: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    commnets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        }
    ]
});

const Post = mongoose.model('Post', postSchema);
export default Post;