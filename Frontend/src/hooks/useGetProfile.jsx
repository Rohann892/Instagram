import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import API_BASE_URL from "../main";

const useGetProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId || userId === "undefined") return;

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/user/profile/${userId}`,
          {
            withCredentials: true,
          },
        );

        if (res.data?.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    fetchUserProfile();
  }, [dispatch, userId]);
};

export default useGetProfile;
