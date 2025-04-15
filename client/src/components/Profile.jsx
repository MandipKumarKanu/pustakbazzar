import React, { useState } from "react";
import PrimaryBtn from "./PrimaryBtn";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaPlus, FaTimes } from "react-icons/fa";
import { Cloudinary } from "cloudinary-core";
import { appySeller, updateProfileApi } from "@/api/auth";
import Badge from "@assets/image/badge.png";
import SellerForm from "./SellerForm";
import { toast } from "sonner";
import getErrorMessage from "@/utils/getErrorMsg";

const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUD_NAME,
  secure: true,
});

const Profile = ({ user }) => {
  const { profile } = user;
  const { user: usr, setUser } = useAuthStore();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenForSeller, setIsModalOpenForSeller] = useState(false);
  const [docFile, setDocFile] = useState(null);

  const [profileData, setProfileData] = useState({
    name: `${profile.firstName} ${profile.lastName}`,
    phone: profile.phNo || "",
    image: profile.profileImg || "",
  });

  const getInitials = () => {
    return `${profile.firstName?.charAt(0) || ""}${
      profile.lastName?.charAt(0) || ""
    }`;
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModalForSeller = () => setIsModalOpenForSeller(true);
  const handleCloseModalForSeller = () => setIsModalOpenForSeller(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfileData((prevData) => ({
        ...prevData,
        image: imageUrl,
        imageFile: file,
      }));
    }
  };

  const handleRemoveImage = () => {
    setProfileData((prevData) => ({
      ...prevData,
      image: "",
    }));
  };

  const handleSave = async () => {
    try {
      let profileImageUrl = profileData.image;

      if (profileData.image && profileData.image.startsWith("blob:")) {
        const formData = new FormData();
        formData.append("file", profileData.imageFile);
        formData.append("upload_preset", "pustakbazar");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${
            cloudinary.config().cloud_name
          }/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const imageData = await response.json();
        profileImageUrl = imageData.secure_url;
      }

      const [firstName, lastName] = profileData.name.split(" ");
        const updatedProfile = {
          firstName: firstName || "",
          lastName: lastName || "",
          phNo: profileData.phone,
          profileImg: profileImageUrl,
        };

      const response = await updateProfileApi(updatedProfile);
      setUser(response.data);
      toast.success("Profile updated successfully!");
      handleCloseModal();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveDoc = async () => {
    if (docFile === null) {
      toast.error("Please upload a document");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", docFile);
      formData.append("upload_preset", "pustakbazar");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          cloudinary.config().cloud_name
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const imageData = await response.json();

      const res = await appySeller(imageData.secure_url);
      setIsModalOpenForSeller(false);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const renderProfileHeader = () => (
    <div className="m-auto flex flex-col items-center gap-4 relative mt-10 px-4">
      <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 relative">
        <Avatar className="w-full h-full">
          <AvatarImage
            src={profile.profileImg}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl sm:text-5xl md:text-6xl font-medium bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {usr?.isSeller?.status === "approved" && (
          <div
            className="absolute bottom-2 right-4 w-14 h-14 bg-white rounded-full border-4 border-primaryColor"
            title="Verified Seller"
          >
            <img src={Badge} alt="Seller Badge" className="w-full" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-sfpro text-center">
          {profile.firstName} {profile.lastName}
        </h1>

        <div className="flex items-center gap-5">
          <PrimaryBtn
            name="Edit Profile"
            style="max-w-[180px]"
            onClick={handleOpenModal}
          />
          <div className="w-[190px] sm:absolute sm:top-4 sm:right-20 sm:w-auto">
            <PrimaryBtn
              name="Add Book +"
              style="max-w-[180px]"
              onClick={() => navigate("/addbook")}
            />
          </div>
          {usr?.isSeller?.status !== "approved" && (
            <div className="w-[190px] sm:absolute sm:top-20 sm:right-20 sm:w-auto">
              <PrimaryBtn
                name="Become a Seller"
                style="max-w-[180px]"
                onClick={handleOpenModalForSeller}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditProfileModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <div className="bg-white p-8 rounded-lg max-w-lg w-full shadow-lg mx-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-gray-900">
              Edit Profile
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex justify-center mb-4 relative">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={profileData.image}
                  alt="Profile Preview"
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-medium bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {profileData.image && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Remove image"
                >
                  <FaTimes size={14} />
                </button>
              )}
            </div>

            <label className="block">
              <span className="text-lg font-medium">Name</span>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            {/* <label className="block">
              <span className="text-lg font-medium">Phone Number</span>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label> */}

            <label className="block">
              <span className="text-lg font-medium">Profile Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-2 text-lg"
              />
            </label>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleCloseModal}
                className="text-lg bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-150"
              >
                Cancel
              </button>

              <PrimaryBtn
                name="Save"
                style="max-w-[150px]"
                onClick={handleSave}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderProfileHeader()}
      {renderEditProfileModal()}
      <SellerForm
        IsModalOpenForSeller={isModalOpenForSeller}
        handleCloseModalForSeller={handleCloseModalForSeller}
        handleSaveDoc={handleSaveDoc}
        setDocFile={setDocFile}
      />
    </>
  );
};

export default Profile;
