import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { USER_API_END_POINT } from "@/lib/constant";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { serverUrl } from "@/App";

const Signup = () => {
  const [login, setLogin] = useState(true);
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginSignupHandler = async (e) => {
    e.preventDefault();
    if (login) {
      try {
        setloading(true);
        const res = await axios.post(
          `${serverUrl}/api/v1/user/login`,
          { email: input.email, password: input.password },
          {
            withCredentials: true,
          },
        );
        if (res.data.success) {
          if (res.data.token) {
            localStorage.setItem("token", res.data.token);
          }
          toast.success(res.data.message);
          dispatch(setAuthUser(res.data.user));
          navigate("/home");
        }
      } catch (error) {
        console.log("Login error:", error.response?.data?.message);
        toast.error(error.response?.data?.message || "Login failed");
      } finally {
        setloading(false);
      }
    } else {
      try {
        setloading(true);
        const res = await axios.post(
          `${serverUrl}/api/v1/user/register`,
          {
            username: input.username,
            email: input.email,
            password: input.password,
          },
          {
            withCredentials: true,
          },
        );
        if (res.data.success) {
          toast.success(res.data.message);
          setInput({
            username: "",
            email: "",
            password: "",
          });
          setLogin(true);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Signup failed");
      } finally {
        setloading(false);
      }
    }
  };
  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={loginSignupHandler}
        className="shadow-xl flex flex-col gap-5 p-8"
      >
        <div className="my-4 text-center">
          <h1 className="font-bold text-3xl tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Connectly
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            <span>{login ? "Log in" : "Sign up"}</span> to see photos and videos from your friends
          </p>
        </div>
        {!login && (
          <div>
            <Label className="font-medium">Username</Label>
            <Input
              type="text"
              name="username"
              value={input.username}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>
        )}
        <div>
          <Label className="font-medium">Email</Label>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        <div>
          <Label className="font-medium">Password</Label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            please wait
          </Button>
        ) : (
          <Button type="submit">{login ? "Login" : "Signup"}</Button>
        )}
        <p className="text-sm text-center cursor-pointer">
          {login ? "Do not have an Account" : "Already have an account"}{" "}
          <span
            onClick={() => setLogin(!login)}
            className="text-blue-600 hover:underline"
          >
            {login ? "Signup" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
