import React, { useEffect, useState } from "react";
import { AvatarFallback, AvatarImage, Avatar } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Badge, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { CiBookmark } from "react-icons/ci";
import CommentDialog from "./CommentDialog";
import { CiFaceSmile } from "react-icons/ci";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import API_BASE_URL from "../main";

const Post = ({ post }) => {
  const { user } = useSelector((store) => store.auth);
  const { posts, selectedPost } = useSelector((store) => store.post);

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post?.likes?.length || 0);
  const [comment, setComment] = useState(post?.comments);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost?.comments);
    }
  }, [selectedPost]);

  const changeHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const likeOrDislikeHandler = async (postId) => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/post/${postId}/${action}`,
        { id: user?._id },
        { withCredentials: true },
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p,
        );

        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const deletePost = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/post/delete/${post._id}`,
        {},
        {
          withCredentials: true,
        },
      );
      console.log(res);
      if (res.data.success) {
        const updatedPost = posts.filter(
          (postItem) => postItem._id !== post._id,
        );
        dispatch(setPosts(updatedPost));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const commentHandler = async (postId) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/post/${postId}/comment`,
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
          p._id === post._id ? { ...p, comments: updatedCommentData } : p,
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Avatar>
            <AvatarImage src={post?.author?.profileImage} alt="post_image" />
            <AvatarFallback>
              {post?.author?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link to="/profile" className="text-base font-medium">
            {post?.author?.username}
          </Link>
          {user?._id === post?.author?._id && (
            <Badge variant="ghost">Author</Badge>
          )}
          <div className="flex items-center gap-2">
            <span className="top-2">.</span>
            <span className="text-gray-600 text-sm">4h</span>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className={`flex flex-col items-center text-center`}>
            <Button
              onClick={deletePost}
              variant="ghost"
              className={`cursor-pointer w-fit text-[#ed4956] font-bold`}
            >
              {user?._id?.toString() === post?.author?._id?.toString()
                ? "Delete"
                : "Unfollow"}
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
        src={post?.image}
        alt=""
        className="my-2 rounded-md w-full aspect-square object-cover"
      />
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 cursor-pointer">
          <div className="flex gap-2">
            {liked ? (
              <IoMdHeart
                onClick={() => likeOrDislikeHandler(post?._id)}
                className="w-6 h-6 text-red-500 cursor-pointer"
              />
            ) : (
              <IoMdHeartEmpty
                onClick={() => likeOrDislikeHandler(post?._id)}
                className="w-6 h-6 cursor-pointer"
              />
            )}
            <span>{postLike}</span>
          </div>
          <div className="flex gap-2">
            <MessageCircle
              onClick={() => {
                setOpen(true);
                dispatch(setSelectedPost(post));
              }}
              className="w-5 h-5"
            />
            <span>{post?.comments?.length || 0}</span>
          </div>
          <Send className="w-5 h-5" />
        </div>
        <div>
          <CiBookmark className="w-6 h-6 cursor-pointer" />
        </div>
      </div>
      <p>
        <span className="text-base font-semibold">Rohann</span> {post?.caption}
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
          <span
            onClick={() => commentHandler(post?._id)}
            className="text-sm px-2 py-1 bg-[#3badf8] text-white rounded-md"
          >
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
