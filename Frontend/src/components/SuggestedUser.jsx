import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SuggestedUser = ({ suggestedUser }) => {
  return (
    <div className="flex items-center justify-between py-1">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Link to={`/profile/${suggestedUser?._id}`}>
          <Avatar>
            <AvatarImage src={suggestedUser?.profileImage} alt="user profile" />
            <AvatarFallback>
              {suggestedUser?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-col">
          <Link to={`/profile/${suggestedUser?._id}`}>
            <h1 className="font-semibold text-sm">{suggestedUser?.username}</h1>
            <span className="text-xs text-gray-500">
              {suggestedUser?.bio || "Bio here............"}
            </span>
          </Link>
        </div>
      </div>

      {/* Follow button always right */}
      <p className="text-sm text-blue-500 font-semibold hover:underline cursor-pointer">
        Follow
      </p>
    </div>
  );
};

export default SuggestedUser;
