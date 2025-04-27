import React, { useEffect } from "react";
import Profile from "../components/Profile";
import ProfileBooks from "../components/ProfileBooks";
import { useAuthStore } from "@/store/useAuthStore";
import Loader from "@/components/Loader";

const ProfilePage = () => {
  const { user, getProfile, loading } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      await getProfile();
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <>
      <Profile user={user} />
      <ProfileBooks user={user} />
    </>
  );
};

export default ProfilePage;
