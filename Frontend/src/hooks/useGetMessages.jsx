import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "@/redux/chatSlice";
import { MESSAGE_API_END_POINT } from "@/lib/constant";

const useGetMessages = () => {
    const { selectedUser } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${MESSAGE_API_END_POINT}/getMessage/${selectedUser?._id}`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.log(error);
            }
        };

        if (selectedUser) {
            fetchMessages();
        }
    }, [selectedUser, dispatch]);
};

export default useGetMessages;
