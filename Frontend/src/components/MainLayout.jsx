import React from "react";
import LeftSideBar from "./LeftSideBar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <LeftSideBar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
