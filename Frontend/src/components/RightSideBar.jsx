import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";

const RightSideBar = () => {
  const { user, suggestedUsers } = useSelector((store) => store.auth);
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
      <div className="flex justify-between my-6">
        <p className="font-semibold text-gray-500/80 text-sm">
          Suggested for you
        </p>

        <p className="text-sm">See All</p>
      </div>
      {suggestedUsers.map((suggestedUser, index) => (
        <SuggestedUser key={index} suggestedUser={suggestedUser} />
      ))}
      <div className="flex flex-col">
        <p className="text-sm text-gray-400">
          About Help Press, API, Jobs Privacy, Terms
        </p>
        <p className="text-sm text-gray-400">Location Language. Meta verfied</p>
        <span className="text-sm text-gray-400 mt-5">
          © 2026 INSTAGRAM FROM META
        </span>
      </div>
    </div>
  );
};

export default RightSideBar;
