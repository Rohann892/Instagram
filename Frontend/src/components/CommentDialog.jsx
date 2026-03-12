import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import PostImg from "../assets/postImage.jpg";
import { MessageCircle, MoreHorizontal, Send, TicketX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { IoMdHeartEmpty } from "react-icons/io";
import { CiBookmark, CiFaceSmile } from "react-icons/ci";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");

  const changeHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const submitHandler = () => {
    console.log(text);
  };
  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className={`!max-w-5xl p-0 flex flex-col`}
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img src={PostImg} alt="" className="rounded-l-xl" />
          </div>
          <div className="w-1/2 flex flex-col justify-between mt-2 ml-4">
            <div className="flex items-center justify-between border-b border-gray-100 p-2">
              <div className="flex gap-2 items-center">
                <Avatar>
                  <AvatarImage src="" alt="user_img" />
                  <AvatarFallback>Cn</AvatarFallback>
                </Avatar>
                <Link to="/profile">Rohann</Link>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
                <DialogContent
                  className={`flex flex-col items-center text-center`}
                >
                  <Button
                    variant="ghost"
                    className={`cursor-pointer w-fit text-[#ed4956] font-bold`}
                  >
                    Report
                  </Button>
                  <Button
                    variant="ghost"
                    className={`cursor-pointer w-fit text-[#ed4956] font-bold`}
                  >
                    Unfollow
                  </Button>
                  <Button variant="ghost" className={`cursor-pointer w-fit`}>
                    Add to favorites
                  </Button>
                  <Button variant="ghost" className={`cursor-pointer w-fit`}>
                    Go to post
                  </Button>
                  <Button variant="ghost" className={`cursor-pointer w-fit`}>
                    Share to...
                  </Button>
                  <Button variant="ghost" className={`cursor-pointer w-fit`}>
                    Copy Link
                  </Button>
                  <Button variant="ghost" className={`cursor-pointer w-fit`}>
                    About this account
                  </Button>
                  <Button variant="ghost" className={`cursor-pointer w-fit`}>
                    Cancel
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 overflow-y-auto p-4 border-b border-gray-100">
              comments will come here
            </div>
            <div className="flex flex-col mt-2 pb-4 border-b border-gray-100">
              <div className="flex justify-between space-y-2 p-2">
                <div className="flex gap-3 cursor-pointer">
                  <IoMdHeartEmpty className="w-6 h-6" />
                  <MessageCircle className="w-5 h-5" />
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <CiBookmark className="w-6 h-6 cursor-pointer" />
                </div>
              </div>
              <span className="font-semibold pl-2">25k likes</span>
              <span className="pl-2">4 hours ago</span>
            </div>
            <div className="flex justify-between mt-3 p-2">
              <div className="flex gap-3">
                <CiFaceSmile className="w-8 h-8" />
                <input
                  type="text"
                  value={text}
                  onChange={changeHandler}
                  placeholder="Add a comment...."
                  className="w-full border-none outline-none font-medium"
                />
              </div>
              <Button
                onClick={submitHandler}
                disabled={!text.trim()}
                className={`bg-transparent text-gray-500 text-base font-medium`}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
