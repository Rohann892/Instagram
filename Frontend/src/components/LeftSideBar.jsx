import {
  Heart,
  Home,
  LogOut,
  MessageSquare,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React from "react";
import Profile from "./Profile";
import { AvatarFallback, AvatarImage, Avatar } from "./ui/avatar";
const sideBarItems = [
  { icon: <Home />, text: "Home" },
  { icon: <Search />, text: "Search" },
  { icon: <TrendingUp />, text: "TrendingUp" },
  { icon: <MessageSquare />, text: "Message" },
  { icon: <Heart />, text: "Heart" },
  { icon: <PlusSquare />, text: "Create" },
  {
    icon: (
      <Avatar>
        <AvatarImage
          src="https://github.com/shadcn.png"
          alt="@shadcn"
          className="grayscale"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ),
    text: "Profile",
  },
  { icon: <LogOut />, text: "LogOut" },
];

const LeftSideBar = () => {
  return (
    <div>
      {sideBarItems.map((item, index) => {
        return (
          <div key={index}>
            {item.icon}
            <span>{item.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LeftSideBar;
