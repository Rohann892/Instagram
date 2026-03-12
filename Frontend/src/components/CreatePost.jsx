import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import React, { useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { readFileAsDataUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const createPostHandler = async () => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    console.log(caption);
    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:8080/api/v1/post/addpost`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      console.log(res);
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.data.response.message);
    } finally {
      setLoading(false);
    }
  };

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataUrl(file);
      setImagePreview(dataUrl);
    }
  };
  return (
    <div>
      <Dialog open={open}>
        <DialogContent
          className={`text-center font-semibold`}
          onInteractOutside={() => setOpen(false)}
        >
          Create New Post
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src={user?.profileImage} alt="" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-xs">{user?.username}</h1>
              <span className="font-semibold text-xs">{user?.bio}</span>
            </div>
          </div>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className={`focus-visible:ring-transparent border-none`}
            placeholder="Write a caption"
          />
          {imagePreview && (
            <div className="w-full h-64 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="preview_image"
                className="object-cover h-full w-full rounded-md"
              />
            </div>
          )}
          <input
            ref={imageRef}
            type="file"
            className="hidden"
            onChange={fileChangeHandler}
          />
          <Button
            onClick={() => imageRef.current.click()}
            className={`w-fit mx-auto bg-[#0095f6] hover:bg-[#0482d6]`}
          >
            Select from Computer
          </Button>
          {imagePreview &&
            (loading ? (
              <Button>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              </Button>
            ) : (
              <Button onClick={createPostHandler} type="submit">
                Post
              </Button>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePost;
