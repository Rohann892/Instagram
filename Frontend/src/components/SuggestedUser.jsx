import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SuggestedUser = () => {
  const { user } = useSelector((store) => store.auth);

  return (
    <>
      <div className="flex justify-between my-6">
        <p className="font-semibold text-gray-500/80 text-sm">
          Suggested for you
        </p>

        <p className="text-sm">See All</p>
      </div>
      <div className="flex flex-col space-y-3">
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
            <p className="text-sm text-blue-500/80 hover:underline">Follow</p>
          </div>
        </div>
        {/* user - 2 */}
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
            <p className="text-sm text-blue-500/80 hover:underline">Follow</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-sm text-gray-400">
          About Help Press, API, Jobs Privacy, Terms
        </p>
        <p className="text-sm text-gray-400">Location Language. Meta verfied</p>
        <span className="text-sm text-gray-400 mt-5">
          © 2026 INSTAGRAM FROM META
        </span>
      </div>
    </>
  );
};

export default SuggestedUser;
