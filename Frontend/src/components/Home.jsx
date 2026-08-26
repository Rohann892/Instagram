import React from "react";
import { Outlet } from "react-router-dom";
import RightSideBar from "./RightSideBar";
import Feed from "./Feed";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUser from "@/hooks/useGetSuggestedUser";

const Home = () => {
  useGetAllPost();
  useGetSuggestedUser();
  return (
    <div className="w-full max-w-6xl mx-auto flex justify-center gap-8 px-2 sm:px-4 py-3 md:py-6">
      <div className="w-full max-w-xl flex flex-col items-center">
        <Feed />
        <Outlet />
      </div>
      <RightSideBar />
    </div>
  );
};

export default Home;
