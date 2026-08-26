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
import { serverUrl } from "@/App";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        `${serverUrl}/api/v1/post/${postId}/${action}`,
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
        `${serverUrl}/api/v1/post/delete/${post._id}`,
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
        `${serverUrl}/api/v1/post/${postId}/comment`,
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
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm mb-6 w-full max-w-lg mx-auto transition-all">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex gap-2.5 items-center">
          <Link to={`/profile/${post?.author?._id}`}>
            <Avatar className="h-9 w-9 ring-2 ring-purple-500/20">
              <AvatarImage src={post?.author?.profileImage} alt="post_image" />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">
                {post?.author?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={`/profile/${post?.author?._id}`}
              className="text-sm font-semibold text-slate-800 hover:text-purple-600 transition-colors"
            >
              {post?.author?.username}
            </Link>
            {user?._id === post?.author?._id && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700">
                Author
              </Badge>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 cursor-pointer" />
            </button>
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-center rounded-2xl max-w-xs">
            <Button
              onClick={deletePost}
              variant="ghost"
              className="cursor-pointer w-full text-red-500 font-semibold hover:bg-red-50"
            >
              {user?._id?.toString() === post?.author?._id?.toString()
                ? "Delete Post"
                : "Unfollow"}
            </Button>
            <Button variant="ghost" className="cursor-pointer w-full text-slate-700">
              Cancel
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Post Media */}
      {post?.image && (
        <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
          <img
            src={post?.image}
            alt="post content"
            className="w-full aspect-square object-cover hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-3 px-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => likeOrDislikeHandler(post?._id)}
            className="flex items-center gap-1.5 text-slate-700 hover:text-red-500 transition-colors group"
          >
            {liked ? (
              <IoMdHeart className="w-6 h-6 text-red-500 scale-110 transition-transform" />
            ) : (
              <IoMdHeartEmpty className="w-6 h-6 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-semibold">{postLike}</span>
          </button>

          <button
            onClick={() => {
              setOpen(true);
              dispatch(setSelectedPost(post));
            }}
            className="flex items-center gap-1.5 text-slate-700 hover:text-purple-600 transition-colors group"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">{post?.comments?.length || 0}</span>
          </button>

          <button className="text-slate-700 hover:text-purple-600 transition-colors">
            <Send className="w-5 h-5 hover:scale-110 transition-transform" />
          </button>
        </div>

        <button className="text-slate-700 hover:text-purple-600 transition-colors">
          <CiBookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Caption & Author */}
      {post?.caption && (
        <div className="mt-2 px-1 text-sm text-slate-800">
          <Link
            to={`/profile/${post?.author?._id}`}
            className="font-semibold mr-2 hover:text-purple-600 transition-colors"
          >
            {post?.author?.username}
          </Link>
          <span className="text-slate-700">{post?.caption}</span>
        </div>
      )}

      {/* Comments link */}
      {post?.comments?.length > 0 && (
        <p
          onClick={() => {
            setOpen(true);
            dispatch(setSelectedPost(post));
          }}
          className="text-xs text-slate-400 mt-1 px-1 cursor-pointer hover:text-slate-600"
        >
          View all {post.comments.length} comments
        </p>
      )}

      <CommentDialog open={open} setOpen={setOpen} />

      {/* Comment Input */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 px-1">
        <input
          type="text"
          value={text}
          onChange={changeHandler}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-sm placeholder:text-slate-400 outline-none"
        />
        {text ? (
          <button
            onClick={() => commentHandler(post?._id)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Post
          </button>
        ) : (
          <CiFaceSmile className="w-5 h-5 text-slate-400" />
        )}
      </div>
    </div>
  );
};

export default Post;
