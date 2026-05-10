import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name: 'realTimeNotification',
    initialState: {
        likeNotification: [],
        messageNotification: [],
    },
    reducers: {
        setLikeNotification: (state, action) => {
            if(action.payload.type === 'like'){
                state.likeNotification.push(action.payload);
            } else if (action.payload.type === 'dislike') {
                state.likeNotification = state.likeNotification.filter((item) => item.userId !== action.payload.userId);
            }
        },
        clearLikeNotification: (state) => {
            state.likeNotification = [];
        },
        setMessageNotification: (state, action) => {
             if (action.payload.type === 'add') {
                 // Check if the message from this user is already in unseen messages, if not, add them
                 const existing = state.messageNotification.find(msg => msg.senderId === action.payload.message.senderId);
                 if (!existing) {
                     state.messageNotification.push(action.payload.message);
                 }
             } else if (action.payload.type === 'clear') {
                 state.messageNotification = state.messageNotification.filter(msg => msg.senderId !== action.payload.senderId);
             }
        }
    }
});

export const { setLikeNotification, clearLikeNotification, setMessageNotification } = rtnSlice.actions;
export default rtnSlice.reducer;
