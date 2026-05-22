import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification } from "./redux/rtnSlice";
import { setIncomingCall, setCallStatus } from "./redux/callSlice";
import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import CallModal from "./components/CallModal";

// Protects routes — redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "profile/:id",
        element: <Profile />,
      },
      {
        path: "account/edit",
        element: <EditProfile />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Signup />,
  },
]);

export const serverUrl = "http://localhost:8080";

function App() {
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io(serverUrl, {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));

      // listen to all the events
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on("notification", (notification) => {
        console.log("RECEIVED NOTIFICATION IN FRONTEND:", notification);
        dispatch(setLikeNotification(notification));
      });

      // Listen for incoming calls
      socketio.on("incomingCall", (callData) => {
        dispatch(setIncomingCall(callData));
        dispatch(setCallStatus("ringing"));
      });

      return () => {
        socketio.off("getOnlineUsers");
        socketio.off("notification");
        socketio.off("incomingCall");
        socketio.close();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <CallModal />
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;

