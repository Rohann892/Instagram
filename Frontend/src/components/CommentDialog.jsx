import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import PostImg from "../assets/postImage.jpg";
import {
  Badge,
  MessageCircle,
  MoreHorizontal,
  Send,
  TicketX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { IoMdHeartEmpty } from "react-icons/io";
import { CiBookmark, CiFaceSmile } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { setPosts } from "@/redux/postSlice";
import { toast } from "sonner";

const CommentDialog = ({ open, setOpen }) => {
  const { posts, selectedPost } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);

  const [comment, setComment] = useState(selectedPost?.comments || []);
  const dispatch = useDispatch();
  const [text, setText] = useState("");

  const changeHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const sendMessageHandler = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:8080/api/v1/post/${postId}/comment`,
        { text, id: user?._id },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: [...comment, res.data.comment] }
            : p,
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className={`!max-w-5xl p-0 flex flex-col`}
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img src={selectedPost?.image} alt="" className="rounded-l-xl" />
          </div>
          <div className="w-1/2 flex flex-col justify-between mt-2 ml-4">
            <div className="flex items-center justify-between border-b border-gray-100 p-2">
              <div className="flex gap-2 items-center">
                <Avatar>
                  <AvatarImage
                    src={selectedPost?.author?.profileImage}
                    alt="user_img"
                  />
                  <AvatarFallback>Cn</AvatarFallback>
                </Avatar>
                <Link to="/profile">{selectedPost?.author?.username}</Link>
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
              {comment?.map((comment) => (
                <Comment key={comment?._id} comment={comment} />
              ))}
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
              <span className="font-semibold pl-2">
                {selectedPost?.likes?.length}
              </span>
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
                onClick={() => sendMessageHandler(selectedPost?._id)}
                disabled={!text.trim()}
                className={`bg-blue-600 text-white text-base font-medium`}
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
