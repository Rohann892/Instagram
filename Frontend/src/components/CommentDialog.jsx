import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  MessageCircle,
  MoreHorizontal,
  Send,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { CiBookmark, CiFaceSmile } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { setPosts } from "@/redux/postSlice";
import { toast } from "sonner";
import { serverUrl } from "@/App";

const CommentDialog = ({ open, setOpen }) => {
  const { posts, selectedPost } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);

  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost?.comments || []);
    }
  }, [selectedPost]);

  const changeHandler = (e) => {
    setText(e.target.value);
  };

  const sendMessageHandler = async (postId) => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `${serverUrl}/api/v1/post/${postId}/comment`,
        { text, id: user?._id },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newComment = res.data.comment;
        const updatedCommentData = [...comment, newComment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="w-[94vw] sm:w-[90vw] md:max-w-4xl max-h-[85vh] p-0 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row bg-white shadow-2xl border border-slate-200"
      >
        {/* ─── POST IMAGE (Hidden on small mobile if preferred or shown nicely on desktop) ─── */}
        {selectedPost?.image && (
          <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center overflow-hidden">
            <img
              src={selectedPost?.image}
              alt="post"
              className="w-full h-full max-h-[85vh] object-contain"
            />
          </div>
        )}

        {/* ─── COMMENTS & ACTIONS PANEL ─── */}
        <div className="w-full md:w-1/2 flex flex-col h-[75vh] md:h-[85vh] bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <Link
                to={`/profile/${selectedPost?.author?._id}`}
                onClick={() => setOpen(false)}
              >
                <Avatar className="h-9 w-9 ring-2 ring-purple-500/20">
                  <AvatarImage
                    src={selectedPost?.author?.profileImage}
                    alt={selectedPost?.author?.username}
                  />
                  <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-xs">
                    {selectedPost?.author?.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  to={`/profile/${selectedPost?.author?._id}`}
                  onClick={() => setOpen(false)}
                  className="font-bold text-sm text-slate-800 hover:text-purple-600 transition-colors"
                >
                  {selectedPost?.author?.username}
                </Link>
                {selectedPost?.caption && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {selectedPost.caption}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-50">
            {comment && comment.length > 0 ? (
              comment.map((item, index) => (
                <div key={item?._id || index} className="pt-2 first:pt-0">
                  <Comment comment={item} />
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MessageCircle className="w-10 h-10 mb-2 text-purple-200" />
                <p className="font-semibold text-slate-700 text-sm">No comments yet</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Be the first to start the conversation!
                </p>
              </div>
            )}
          </div>

          {/* Post Actions & Likes summary */}
          <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-slate-700">
                <IoMdHeartEmpty className="w-6 h-6 hover:text-red-500 cursor-pointer transition-colors" />
                <MessageCircle className="w-5 h-5 hover:text-purple-600 cursor-pointer transition-colors" />
                <Send className="w-5 h-5 hover:text-purple-600 cursor-pointer transition-colors" />
              </div>
              <CiBookmark className="w-6 h-6 text-slate-700 hover:text-purple-600 cursor-pointer transition-colors" />
            </div>

            <p className="text-xs font-semibold text-slate-800">
              {selectedPost?.likes?.length || 0} likes
            </p>
          </div>

          {/* Add Comment Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessageHandler(selectedPost?._id);
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <CiFaceSmile className="w-6 h-6 text-slate-400 hidden sm:block shrink-0" />
            <input
              type="text"
              value={text}
              onChange={changeHandler}
              placeholder="Add a comment..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:outline-none transition-colors"
            />
            <Button
              type="submit"
              disabled={!text.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              Post
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;

