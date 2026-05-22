import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser, setMessages } from "@/redux/chatSlice";
import { setMessageNotification } from "@/redux/rtnSlice";
import { setOutgoingCall, setCallStatus } from "@/redux/callSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Phone, Video } from "lucide-react";
import axios from "axios";
import { MESSAGE_API_END_POINT } from "@/lib/constant";
import useGetMessages from "@/hooks/useGetMessages";
import useRealTimeMessage from "@/hooks/useRealTimeMessage";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  const { selectedUser, onlineUsers, messages } = useSelector(
    (store) => store.chat
  );
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  // Initiate an outgoing call
  const startCall = (type) => {
    if (!selectedUser) return;
    dispatch(
      setOutgoingCall({
        receiverId: selectedUser._id,
        receiverName: selectedUser.username,
        receiverAvatar: selectedUser.profileImage,
        callType: type,
      })
    );
    dispatch(setCallStatus("ringing"));
  };

  // Initialize hooks to fetch historical messages and listen to socket
  useGetMessages();
  useRealTimeMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageHandler = async () => {
    if (!textMessage.trim()) return;
    try {
      const res = await axios.post(
        `${MESSAGE_API_END_POINT}/sendMessage/${selectedUser?._id}`,
        { message: textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // cleanup selected user when leaving chat page
  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  return (
    <div className="flex ml-[16%] h-screen border-l border-gray-300">
      <section className="w-1/3 sm:w-1/4 md:w-1/3 border-r border-gray-300 flex flex-col h-full">
        <div className="p-4 border-b border-gray-300 font-bold text-xl">
          {user?.username}
        </div>
        <div className="flex-1 overflow-y-auto">
          {suggestedUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <div
                key={suggestedUser?._id}
                onClick={() => {
                  dispatch(setSelectedUser(suggestedUser));
                  dispatch(setMessageNotification({ type: 'clear', senderId: suggestedUser?._id }));
                }}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                  selectedUser?._id === suggestedUser?._id ? "bg-gray-100" : ""
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={suggestedUser?.profileImage} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold">{suggestedUser?.username}</p>
                  <p className="text-xs text-gray-500">
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex-1 flex flex-col h-full bg-white">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-300 bg-white sticky top-0 z-10">
              <Avatar>
                <AvatarImage src={selectedUser?.profileImage} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{selectedUser?.username}</p>
              </div>
              {/* Call buttons */}
              <button
                id="audio-call-btn"
                onClick={() => startCall("audio")}
                title="Audio call"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-green-600"
              >
                <Phone size={20} />
              </button>
              <button
                id="video-call-btn"
                onClick={() => startCall("video")}
                title="Video call"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600"
              >
                <Video size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-gray-50">
              {messages.map((msg) => {
                const isMyMessage = msg.senderId === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isMyMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-xl ${
                        isMyMessage
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-black rounded-bl-sm"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-300 bg-white">
              <div className="flex gap-2">
                <Input
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessageHandler();
                  }}
                  type="text"
                  placeholder="Message..."
                  className="flex-1 focus-visible:ring-transparent"
                />
                <Button onClick={sendMessageHandler} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Send className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-xl font-semibold text-gray-800">Your Messages</p>
            <p>Send private photos and messages to a friend or group.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatPage;
