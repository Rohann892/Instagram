import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profileImage || "");
  const [bio, setBio] = useState(user?.bio || "");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (bio) formData.append("bio", bio);
      if (profileImage) formData.append("profileImage", profileImage);

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/user/profile/edit`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        toast.success("Profile updated successfully");
        navigate(`/profile/${user?._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-8">
      <h1 className="text-2xl font-bold mb-8">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={previewImage} />
            <AvatarFallback>
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="max-w-xs"
          />
          <p className="text-sm text-gray-600">JPG, PNG or GIF. Max 5MB.</p>
        </div>

        {/* Bio Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            {bio.length}/150 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/profile/${user?._id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
