import React, { useState } from "react";
import { AvatarFallback, AvatarImage, Avatar } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import PostImage from "../assets/postImage.jpg";
import { IoMdHeartEmpty } from "react-icons/io";
import { FaRegComment } from "react-icons/fa";
import { CiBookmark } from "react-icons/ci";
import CommentDialog from "./CommentDialog";
import { CiFaceSmile } from "react-icons/ci";
import { Link } from "react-router-dom";

const Post = () => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const changeHandler = (e) => {
    const inputText = e.target.value;
    if (inputText) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Avatar>
            <AvatarImage src="" alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Link to="/profile" className="text-base font-medium">
            Rohann
          </Link>
          <div className="flex items-center gap-2">
            <span className="top-2">.</span>
            <span className="text-gray-600 text-sm">4h</span>
          </div>
        </div>
        <Dialog>
          <DialogTrigger as child>
            <MoreHorizontal className="curosr-pointer" />
          </DialogTrigger>
          <DialogContent className={`flex flex-col items-center text-center`}>
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
              Cancel
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <img
        src={PostImage}
        alt=""
        className="my-2 rounded-md w-full aspect-square object-cover"
      />
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 cursor-pointer">
          <div className="flex gap-2">
            <IoMdHeartEmpty className="w-6 h-6" />
            <span>1k</span>
          </div>
          <div className="flex gap-2">
            <MessageCircle onClick={() => setOpen(true)} className="w-5 h-5" />
            <span>25</span>
          </div>
          <Send className="w-5 h-5" />
        </div>
        <div>
          <CiBookmark className="w-6 h-6 cursor-pointer" />
        </div>
      </div>
      <p>
        <span className="text-base font-semibold">Rohann</span> user captions
      </p>
      {/* <span className="cursor-pointer text-sm text-gray-400">
        View all 25 comments
      </span> */}
      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={text}
          onChange={changeHandler}
          placeholder="Add a Comment"
          className="outline-none text-sm"
        />
        {text ? (
          <span className="text-sm px-2 py-1 bg-[#3badf8] text-white rounded-md">
            Post
          </span>
        ) : (
          <CiFaceSmile />
        )}
      </div>
    </div>
  );
};

export default Post;
