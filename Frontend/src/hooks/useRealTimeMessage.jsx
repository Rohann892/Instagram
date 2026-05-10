import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "@/redux/chatSlice";

const useRealTimeMessage = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);
    const { messages, selectedUser } = useSelector(store => store.chat);

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            // Only append the message if the chat is currently active with the sender
            if (selectedUser?._id === newMessage.senderId) {
                dispatch(setMessages([...messages, newMessage]));
            }
        });

        return () => {
            socket.off("newMessage");
        };
    }, [messages, setMessages, socket, selectedUser, dispatch]);
};

export default useRealTimeMessage;
