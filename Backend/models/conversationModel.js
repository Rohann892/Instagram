import mongoose from "mongoose";

const conversationModel = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    message: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        }
    ]
});

const Conversation = mongoose.model('Conversation', conversationModel);
export default Conversation;