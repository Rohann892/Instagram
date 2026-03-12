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
        console.log("Attempting login with:", input);
        const res = await axios.post(
          `${USER_API_END_POINT}/login`,
          { email: input.email, password: input.password },
          {
            withCredentials: true,
          },
        );
        if (res.data.success) {
          toast.success(res.data.message);
          console.log("Login successful:", res);
          dispatch(setAuthUser(res.data.user));
          navigate("/home");
        }
      } catch (error) {
        console.log("Login error:", error.response?.data?.message);
      } finally {
        setloading(false);
      }
    } else {
      try {
        setloading(false);
        const res = await axios.post(
          `${USER_API_END_POINT}/register`,
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
          console.log(res);
          setLogin(true);
        }
      } catch (error) {
        console.log(error);
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
        <div className="my-4">
          <h1 className="font-bold text-center text-2xl">Logo</h1>
          <p>
            <span>{login ? "Login" : "Signup"}</span> to see Photos and videos
            from your friend
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
        <p className="text-sm text-center">
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
