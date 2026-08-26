import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { serverUrl } from "@/App";

const Signup = () => {
  const [login, setLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginSignupHandler = async (e) => {
    e.preventDefault();
    if (login) {
      try {
        setLoading(true);
        const res = await axios.post(
          `${serverUrl}/api/v1/user/login`,
          { email: input.email, password: input.password },
          { withCredentials: true }
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
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const res = await axios.post(
          `${serverUrl}/api/v1/user/register`,
          {
            username: input.username,
            email: input.email,
            password: input.password,
          },
          { withCredentials: true }
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
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 relative overflow-hidden">
      {/* Decorative gradient blur orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/25 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
            Connectly
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {login
              ? "Welcome back! Connect and share with friends"
              : "Join Connectly today and start exploring"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl mb-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setLogin(true)}
            className={`py-2 rounded-lg transition-all ${
              login
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setLogin(false)}
            className={`py-2 rounded-lg transition-all ${
              !login
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={loginSignupHandler} className="space-y-4">
          {!login && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Username
              </Label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  name="username"
                  required
                  placeholder="Enter your username"
                  value={input.username}
                  onChange={changeEventHandler}
                  className="pl-10 h-11 bg-slate-50/70 border-slate-200 focus:bg-white rounded-xl text-sm transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={input.email}
                onChange={changeEventHandler}
                className="pl-10 h-11 bg-slate-50/70 border-slate-200 focus:bg-white rounded-xl text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Password
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="Enter password"
                value={input.password}
                onChange={changeEventHandler}
                className="pl-10 pr-10 h-11 bg-slate-50/70 border-slate-200 focus:bg-white rounded-xl text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:via-pink-700 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <span>{login ? "Log In" : "Create Account"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {login ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setLogin(!login)}
            className="font-semibold text-pink-600 hover:text-purple-600 transition-colors cursor-pointer"
          >
            {login ? "Sign up now" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;

