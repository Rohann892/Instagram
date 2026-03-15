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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_END_POINT } from "@/lib/constant";
import axios from "axios";
import { IoLogoInstagram } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
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
    }
  };
  const sideBarItems = [
    { icon: <Home size={22} />, text: "Home" },
    { icon: <Search size={22} />, text: "Search" },
    { icon: <TrendingUp size={22} />, text: "Trending" },
    { icon: <MessageCircle size={22} />, text: "Message" },
    { icon: <Heart size={22} />, text: "Notification" },
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
          <IoLogoInstagram className="w-7 h-7" />
        </div>
        <div>
          {sideBarItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer"
            >
              {/* Icon always visible */}
              <div className="flex items-center justify-center min-w-[24px] relative">
                {item.icon}
              </div>

              {/* Text hidden until hover */}
              <span
                onClick={() => sidebarHandler(item.text)}
                className="hidden group-hover:inline whitespace-nowrap"
              >
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
