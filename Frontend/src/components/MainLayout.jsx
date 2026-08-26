import React from "react";
import LeftSideBar from "./LeftSideBar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col md:flex-row">
      <LeftSideBar />
      <main className="flex-1 md:ml-16 lg:ml-60 min-h-screen pt-14 md:pt-0 pb-16 md:pb-0 transition-all">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
