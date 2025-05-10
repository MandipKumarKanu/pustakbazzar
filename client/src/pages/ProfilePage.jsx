import React, { useEffect } from "react";
import Profile from "../components/Profile";
import ProfileBooks from "../components/ProfileBooks";
import { useAuthStore } from "@/store/useAuthStore";
import { FiUser } from "react-icons/fi";

const ProfileSkeleton = () => {
  return (
    <div className="m-auto flex flex-col items-center gap-4 relative mt-10 px-4 animate-pulse">
      <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-gray-200 rounded-full flex items-center justify-center">
        <FiUser className="w-1/3 h-1/3 text-gray-300" />
      </div>

      <div className="flex flex-col gap-2 items-center">
        <div className="h-10 bg-gray-200 rounded-lg w-60"></div>

        <div className="flex items-center gap-5 mt-2">
          <div className="h-10 bg-gray-200 rounded-lg w-36"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-36"></div>
        </div>
      </div>
    </div>
  );
};

const ProfileTabsSkeleton = () => {
  return (
    <div className="m-auto max-w-[1500px] mt-14 animate-pulse">
      <ul className="flex m-auto max-w-[1300px] justify-between items-center gap-20">
        {[1, 2, 3].map((tab) => (
          <li
            key={tab}
            className="flex flex-col justify-between items-center border-b-[6px] pb-3 border-b-gray-200 rounded-t-lg w-1/4"
          >
            <div className="h-7 bg-gray-200 rounded-lg w-24 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-8"></div>
          </li>
        ))}
      </ul>

      <div className="mt-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex justify-between mt-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
        <ProfileSkeleton />
        <ProfileTabsSkeleton />
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
