import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser, setMessages } from "@/redux/chatSlice";
import { setMessageNotification } from "@/redux/rtnSlice";
import { setOutgoingCall, setCallStatus } from "@/redux/callSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Phone, Video, ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
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
    <div className="w-full h-[calc(100vh-3.5rem)] md:h-screen flex bg-slate-50 border-t md:border-t-0 border-slate-200 overflow-hidden">
      {/* ─── CONTACTS / USERS LIST ─── */}
      <section
        className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full ${
          selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">
              Messages
            </h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
            {suggestedUsers?.length || 0} Contacts
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {suggestedUsers && suggestedUsers.length > 0 ? (
            suggestedUsers.map((suggestedUser) => {
              const isOnline = onlineUsers.includes(suggestedUser?._id);
              const isSelected = selectedUser?._id === suggestedUser?._id;
              return (
                <div
                  key={suggestedUser?._id}
                  onClick={() => {
                    dispatch(setSelectedUser(suggestedUser));
                    dispatch(
                      setMessageNotification({
                        type: "clear",
                        senderId: suggestedUser?._id,
                      })
                    );
                  }}
                  className={`flex items-center gap-3.5 p-3.5 sm:p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-purple-50/80"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12 ring-2 ring-purple-500/20">
                      <AvatarImage src={suggestedUser?.profileImage} />
                      <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                        {suggestedUser?.username?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {suggestedUser?.username}
                      </p>
                      <span
                        className={`text-[11px] font-medium ${
                          isOnline ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {suggestedUser?.bio || "Tap to start conversation"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              No contacts found
            </div>
          )}
        </div>
      </section>

      {/* ─── ACTIVE CHAT CONVERSATION VIEW ─── */}
      <section
        className={`w-full flex-1 flex flex-col h-full bg-slate-50 ${
          !selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedUser ? (
          <>
            {/* Chat Top Header */}
            <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0 z-10">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => dispatch(setSelectedUser(null))}
                  className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="relative">
                  <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
                    <AvatarImage src={selectedUser?.profileImage} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                      {selectedUser?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.includes(selectedUser?._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div>
                  <h2 className="font-bold text-sm text-slate-800">
                    {selectedUser?.username}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {onlineUsers.includes(selectedUser?._id)
                      ? "Active now"
                      : "Offline"}
                  </p>
                </div>
              </div>

              {/* Call Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  id="audio-call-btn"
                  onClick={() => startCall("audio")}
                  title="Audio call"
                  className="p-2.5 rounded-full hover:bg-purple-50 text-slate-600 hover:text-purple-600 transition-colors"
                >
                  <Phone size={18} />
                </button>
                <button
                  id="video-call-btn"
                  onClick={() => startCall("video")}
                  title="Video call"
                  className="p-2.5 rounded-full hover:bg-purple-50 text-slate-600 hover:text-purple-600 transition-colors"
                >
                  <Video size={18} />
                </button>
              </div>
            </div>

            {/* Message Thread Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/70">
              {messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMyMessage = msg.senderId === user?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isMyMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[78%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMyMessage
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none"
                            : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-3 text-purple-300" />
                  <p className="font-semibold text-slate-700 text-sm">
                    Say hello to {selectedUser?.username}!
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Send a message to start the conversation.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessageHandler();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  type="text"
                  placeholder={`Message ${selectedUser?.username}...`}
                  className="flex-1 h-11 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white text-sm"
                />
                <Button
                  type="submit"
                  disabled={!textMessage.trim()}
                  className="h-11 px-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-sm transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 shadow-sm">
              <Send className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Your Messages</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Select a conversation from the list or start a new chat with your friends.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatPage;

