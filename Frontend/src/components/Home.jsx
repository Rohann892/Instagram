import React from "react";
import { Outlet } from "react-router-dom";
import RightSideBar from "./RightSideBar";
import Feed from "./Feed";

const Home = () => {
  return (
    <div className="flex">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSideBar />
    </div>
  );
};

export default Home;
