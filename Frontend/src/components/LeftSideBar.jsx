import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { AvatarFallback, AvatarImage, Avatar } from "./ui/avatar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_END_POINT } from "@/lib/constant";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { clearLikeNotification } from "@/redux/rtnSlice";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { likeNotification, messageNotification } = useSelector(
    (store) => store.realTimeNotification
  );

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data?.success) {
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
    } else if (textType === "Profile") {
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
    { icon: <Home size={22} />, text: "Home", path: "/home" },
    { icon: <Search size={22} />, text: "Search" },
    { icon: <TrendingUp size={22} />, text: "Trending" },
    {
      icon: (
        <div className="relative">
          <MessageCircle size={22} />
          {messageNotification?.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
      ),
      text: "Message",
      path: "/chat",
    },
    {
      icon: (
        <div className="relative">
          <Heart size={22} />
          {likeNotification?.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
      ),
      text: "Notification",
    },
    { icon: <PlusSquare size={22} />, text: "Create" },
    {
      icon: (
        <Avatar className="h-6 w-6 ring-2 ring-purple-500/30">
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback className="text-xs bg-purple-100 text-purple-700 font-semibold">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
      path: `/profile/${user?._id}`,
    },
    { icon: <LogOut size={22} className="text-red-500" />, text: "Logout" },
  ];

  return (
    <>
      {/* ─── MOBILE TOP HEADER (< md) ─── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-lg border-b border-slate-200/80 px-4 flex items-center justify-between z-40">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Sparkles size={16} />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
            Connectly
          </span>
        </Link>

        <div className="flex items-center gap-4 text-slate-700">
          <button
            onClick={() => sidebarHandler("Notification")}
            className="relative p-1 hover:text-slate-900"
          >
            <Heart size={22} />
            {likeNotification?.length > 0 && (
              <span className="absolute 0 top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
          <button
            onClick={() => sidebarHandler("Message")}
            className="relative p-1 hover:text-slate-900"
          >
            <MessageCircle size={22} />
            {messageNotification?.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </header>

      {/* ─── MOBILE BOTTOM BAR (< md) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-4 flex items-center justify-around z-40 shadow-lg">
        <button
          onClick={() => sidebarHandler("Home")}
          className={`p-2 rounded-xl transition-colors ${
            location.pathname === "/home" ? "text-purple-600 font-bold" : "text-slate-600"
          }`}
        >
          <Home size={24} />
        </button>

        <button
          onClick={() => sidebarHandler("Search")}
          className="p-2 text-slate-600 rounded-xl transition-colors"
        >
          <Search size={24} />
        </button>

        <button
          onClick={() => setOpen(true)}
          className="p-2.5 bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 text-white rounded-2xl shadow-md shadow-pink-500/25 active:scale-95 transition-transform"
        >
          <PlusSquare size={22} />
        </button>

        <button
          onClick={() => sidebarHandler("Message")}
          className={`p-2 rounded-xl relative transition-colors ${
            location.pathname === "/chat" ? "text-purple-600" : "text-slate-600"
          }`}
        >
          <MessageCircle size={24} />
          {messageNotification?.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white" />
          )}
        </button>

        <button
          onClick={() => sidebarHandler("Profile")}
          className="p-2 rounded-xl text-slate-600 transition-colors"
        >
          <Avatar className="h-6 w-6 ring-2 ring-purple-500/30">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700 font-semibold">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </nav>

      {/* ─── DESKTOP LEFT SIDEBAR (>= md) ─── */}
      <aside className="hidden md:flex fixed top-0 left-0 z-30 h-screen border-r border-slate-200 bg-white/90 backdrop-blur-lg flex-col justify-between py-6 px-3 transition-all duration-300 w-16 lg:w-60 group shadow-sm">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center gap-3 px-2 py-1 rounded-2xl hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/25 shrink-0">
              <Sparkles size={20} />
            </div>
            <span className="hidden lg:inline font-extrabold text-2xl tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
              Connectly
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="space-y-1.5">
            {sideBarItems.map((item, index) => {
              const isActive = item.path && location.pathname === item.path;
              return (
                <div
                  key={index}
                  onClick={() => sidebarHandler(item.text)}
                  className={`flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group/item ${
                    isActive
                      ? "bg-purple-50 text-purple-700 font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-center min-w-[24px]">
                    {item.icon}
                  </div>
                  <span className="hidden lg:inline text-sm whitespace-nowrap font-medium">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Card at bottom for desktop */}
        {user && (
          <div
            onClick={() => sidebarHandler("Profile")}
            className="hidden lg:flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 cursor-pointer transition-all"
          >
            <Avatar className="h-9 w-9 ring-2 ring-purple-500/30">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {user?.username}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {user?.email || "View profile"}
              </span>
            </div>
          </div>
        )}
      </aside>

      <CreatePost open={open} setOpen={setOpen} />
    </>
  );
};

export default LeftSideBar;
