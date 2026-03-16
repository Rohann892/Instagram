import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import useGetProfile from "@/hooks/useGetProfile";
import { Link, useParams } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { TbMessageCircleFilled } from "react-icons/tb";

const Profile = () => {
  const { id } = useParams();
  useGetProfile(id);
  const { user, userProfile } = useSelector((store) => store.auth);
  const profile = userProfile || user;
  const isFollowing = false;

  // useState
  const [activeTab, setActiveTabs] = useState("post");

  const handleTabChange = (tab) => {
    setActiveTabs(tab);
  };

  const displayedPost =
    activeTab === "post" ? profile?.posts : profile?.bookmarks;
  return (
    <div className="h-screen max-w-6xl mx-auto flex items-start justify-center gap-16 mt-15">
      <div className="flex flex-col gap-20 p-8">
        <div className="grid grid-cols-2">
          {/* Avatar */}
          <div className="flex items-center justify-center">
            <Avatar className="w-50 h-50">
              <AvatarImage src={profile?.profileImage} />
              <AvatarFallback>
                {profile?.username?.charAt(0).toUpperCase() || "CN"}
              </AvatarFallback>
            </Avatar>
          </div>
          {/* Avatar */}
          <div className="flex flex-col space-y-4">
            <div className="flex gap-3 items-center">
              <h1 className="text-xl font-semibold">{profile?.username}</h1>
            </div>

            <div className="flex gap-6">
              <p className="font-semibold text-lg">
                {profile?.posts?.length}
                <span className="font-light ml-1 text-base">posts</span>
              </p>

              <p className="font-semibold text-lg">
                {profile?.followers?.length}
                <span className="font-light ml-1 text-base">followers</span>
              </p>

              <p className="font-semibold text-lg">
                {profile?.following?.length}
                <span className="font-light ml-1 text-base">following</span>
              </p>
            </div>

            <div className="flex gap-1">
              <h1 className="font-bold">{profile?.username}</h1>
              <p className="flew-wrap">| {profile?.bio}</p>
            </div>

            <div>
              <Button variant="ghost" className="bg-gray-300/50">
                @{profile?.username}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              {user?._id === profile?._id ? (
                <>
                  <Link to="/account/edit">
                    <Button variant="secondary" className={`px-15.5`}>
                      Edit Profile
                    </Button>
                  </Link>
                  <Button variant="secondary" className={`px-15.5`}>
                    View Archive
                  </Button>
                </>
              ) : isFollowing ? (
                <>
                  <Button variant="secondary" className={`px-15.5`}>
                    unfollow
                  </Button>
                  <Button variant="secondary" className={`px-15.5`}>
                    Message
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  className="px-30 bg-[#0095f6] hover:bg-[#0b7dc9]"
                >
                  Follow
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border=gray-100">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              onClick={() => handleTabChange("post")}
              className={`py-3 cursor-pointer ${activeTab === "post" ? "font-bold" : ""}`}
            >
              POSTS
            </span>
            <span
              onClick={() => handleTabChange("saved")}
              className={`py-3 cursor-pointer ${activeTab === "saved" ? "font-bold" : ""}`}
            >
              SAVED
            </span>
            <span
              onClick={() => handleTabChange("reels")}
              className={`py-3 cursor-pointer ${activeTab === "reels" ? "font-bold" : ""}`}
            >
              REELS
            </span>
            <span
              onClick={() => handleTabChange("tags")}
              className={`py-3 cursor-pointer ${activeTab === "tags" ? "font-bold" : ""}`}
            >
              TAGS
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.map((post) => {
              return (
                <div key={post?._id} className="relative cursor-pointer">
                  <img
                    src={post?.image}
                    alt=""
                    className="rounded-md aspect-square w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition duration-300">
                    <div className="flex items-center text-white space-x-4">
                      <button className="flex items-center justify-center gap-1 text-lg">
                        <FaHeart />
                        <span>{post?.likes?.length}</span>
                      </button>
                      <button className="flex items-center justify-center gap-1 text-lg">
                        <TbMessageCircleFilled />
                        <span>{post?.comments?.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
