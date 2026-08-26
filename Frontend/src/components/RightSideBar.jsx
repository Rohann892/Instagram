import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";

const RightSideBar = () => {
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  return (
    <aside className="hidden lg:block w-80 sticky top-6 h-fit bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6 shrink-0">
      {/* Current user header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${user?._id}`}>
            <Avatar className="h-11 w-11 ring-2 ring-purple-500/20">
              <AvatarImage src={user?.profileImage} alt="user profileImage" />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link to={`/profile/${user?._id}`}>
              <h2 className="font-bold text-sm text-slate-800 hover:text-purple-600 transition-colors">
                {user?.username}
              </h2>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-[150px]">
                {user?.bio || "Connectly user"}
              </p>
            </Link>
          </div>
        </div>
        <Link
          to={`/profile/${user?._id}`}
          className="text-xs font-semibold text-purple-600 hover:text-purple-700"
        >
          View
        </Link>
      </div>

      {/* Suggested users */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
            Suggested For You
          </h3>
          <button className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            See All
          </button>
        </div>

        <div className="space-y-1">
          {suggestedUsers && suggestedUsers.length > 0 ? (
            suggestedUsers.map((suggestedUser, index) => (
              <SuggestedUser key={index} suggestedUser={suggestedUser} />
            ))
          ) : (
            <p className="text-xs text-slate-400 py-2 text-center">No suggestions right now</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 text-slate-400 text-xs space-y-2">
        <p className="hover:text-slate-500 cursor-pointer transition-colors">
          About • Help • Press • API • Jobs • Privacy • Terms
        </p>
        <p className="font-medium text-slate-400">© 2026 CONNECTLY</p>
      </div>
    </aside>
  );
};

export default RightSideBar;
