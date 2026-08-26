import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { AvatarFallback, AvatarImage, Avatar } from "./ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_END_POINT } from "@/lib/constant";
import axios from "axios";
import { IoLogoInstagram } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { clearLikeNotification } from "@/redux/rtnSlice";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { likeNotification, messageNotification } = useSelector((store) => store.realTimeNotification);
  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        localStorage.removeItem("token");
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        toast.success(res.data.message);
      }
    } catch (error) {
      localStorage.removeItem("token");
      toast.error(error.response?.data?.message || "Logged out");
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
      navigate("/login");
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType == "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/home");
    } else if (textType === "Message") {
      navigate("/chat");
    } else if (textType === "Notification") {
      dispatch(clearLikeNotification());
    }
  };
  const sideBarItems = [
    { icon: <Home size={22} />, text: "Home" },
    { icon: <Search size={22} />, text: "Search" },
    { icon: <TrendingUp size={22} />, text: "Trending" },
    { 
      icon: (
        <div className="relative">
          <MessageCircle size={22} />
          {messageNotification.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          )}
        </div>
      ), 
      text: "Message" 
    },
    { 
      icon: (
        <div className="relative">
          <Heart size={22} />
          {likeNotification.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          )}
        </div>
      ), 
      text: "Notification" 
    },
    { icon: <PlusSquare size={22} />, text: "Create" },
    {
      icon: (
        <Avatar className="h-6 w-6">
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut size={22} />, text: "Logout" },
  ];
  return (
    <div className="group fixed top-0 left-0 z-10 h-screen border-r border-gray-300 bg-white transition-all duration-300 w-16 hover:w-48">
      <div className="flex flex-col mt-6 gap-10 justify-between">
        <div className="flex items-start ml-4">
          <Link to="/home">
            {" "}
            <IoLogoInstagram className="w-7 h-7" />
          </Link>
        </div>
        <div>
          {sideBarItems.map((item, index) => (
            <div
              key={index}
              onClick={() => sidebarHandler(item.text)}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer"
            >
              {/* Icon always visible */}
              <div className="flex items-center justify-center min-w-[24px] relative">
                {item.icon}
              </div>

              {/* Text hidden until hover */}
              <span className="hidden group-hover:inline whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSideBar;
