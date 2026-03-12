import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Comment = ({ comment }) => {
  return (
    <div className="flex gap-3 items-center py-2">
      <Avatar className="w-8 h-8">
        <AvatarImage
          src={comment?.author?.profileImage}
          alt={comment?.author?.username}
        />
        <AvatarFallback>
          {comment?.author?.username?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <p className="text-sm">
        <span className="font-semibold mr-2">{comment?.author?.username}</span>
        <span className="text-gray-700">{comment?.text}</span>
      </p>
    </div>
  );
};

export default Comment;
