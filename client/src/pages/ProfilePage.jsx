import React from "react";
import Profile from "../components/Profile";
import ProfileBooks from "../components/ProfileBooks";
import { useAuthStore } from "@/store/useAuthStore";

const ProfilePage = () => {
  const {user}= useAuthStore()
  return (
    <>
      <Profile user={user}/>
      <ProfileBooks user={user} />
    </>
  );
};

export default ProfilePage;
