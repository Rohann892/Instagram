import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";

const RightSideBar = () => {
  const { user } = useSelector((store) => store.auth);
  return (
    <div className="w-fit p-4 pr-32 border-l-1 border-gray-100 bg-gray-50 rounded-md my-10 space-y-6">
      <div className="flex items-start gap-2">
        <Link to={`/profile/${user?._id}`}>
          <Avatar>
            <AvatarImage src={user?.profileImage} alt="user profileImage" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col gap-1">
          <Link to={`/profile/${user?._id}`}>
            <h1 className="font-semibold text-sm">{user?.username}</h1>
            <span className="text-sm text-gray-600 text-xs">
              {user?.bio || "bio here....."}
            </span>
          </Link>
        </div>
        <div>
          <p className="text-sm text-blue-500/80 hover:underline">Switch</p>
        </div>
      </div>
      <SuggestedUser />
    </div>
  );
};

export default RightSideBar;
