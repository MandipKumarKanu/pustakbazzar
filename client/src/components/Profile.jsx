import React, { useState } from "react";
import PrimaryBtn from "./PrimaryBtn";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaPlus, FaTimes, FaCamera, FaUpload } from "react-icons/fa";
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
  const [isUploading, setIsUploading] = useState(false);

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
      setIsUploading(true);
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
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDoc = async () => {
    if (docFile === null) {
      toast.error("Please upload a document");
      return;
    }

    try {
      setIsUploading(true);
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
    } finally {
      setIsUploading(false);
    }
  };

  const renderProfileHeader = () => (
    <div className="m-auto flex flex-col items-center gap-4 relative mt-6 md:mt-10 px-4">
      <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-60 md:h-60 relative">
        <Avatar className="w-full h-full border-4 border-gray-100 shadow-lg">
          <AvatarImage
            src={profile.profileImg}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="object-cover"
          />
          <AvatarFallback className="text-3xl sm:text-4xl md:text-6xl font-medium bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {usr?.isSeller?.status === "approved" && (
          <div
            className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-full border-4 border-primaryColor shadow-md"
            title="Verified Seller"
          >
            <img src={Badge} alt="Seller Badge" className="w-full" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sfpro text-center">
          {profile.firstName} {profile.lastName}
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 w-full">
          <PrimaryBtn
            name="Edit Profile"
            style="w-full sm:max-w-[180px]"
            onClick={handleOpenModal}
          />

          <div className="w-full sm:w-auto sm:absolute sm:top-4 sm:right-4 md:right-20">
            <PrimaryBtn
              name="Add Book +"
              style="w-full sm:max-w-[180px]"
              onClick={() => navigate("/addbook")}
            />
          </div>

          {usr?.isSeller?.status !== "approved" && (
            <div className="w-full sm:w-auto sm:absolute sm:top-20 sm:right-4 md:right-20">
              <PrimaryBtn
                name="Become a Seller"
                style="w-full sm:max-w-[180px]"
                onClick={handleOpenModalForSeller}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditProfileModal = () => (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-lg w-[95%] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl sm:text-3xl font-semibold text-gray-900 flex justify-between items-center">
            Edit Profile
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 flex flex-col gap-6">
          <div className="flex justify-center mb-4 relative">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-gray-100 shadow-md transition-all duration-300 group-hover:opacity-80">
                <AvatarImage
                  src={profileData.image}
                  alt="Profile Preview"
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl font-medium bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-primary/70 text-white p-2 rounded-full">
                  <FaCamera size={20} />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {profileData.image && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                  title="Remove image"
                >
                  <FaTimes size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-base sm:text-lg font-medium text-gray-700">
                Full Name
              </span>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all duration-200"
                placeholder="Your full name"
              />
            </label>

            <label className="block relative">
              <span className="text-base sm:text-lg font-medium text-gray-700">
                Profile Image
              </span>
              <div className="mt-2 relative flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="profile-image-upload"
                  className="hidden"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="flex-1 cursor-pointer bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-base flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <FaUpload className="text-gray-500" />
                  <span className="text-gray-500 truncate">
                    {profileData.imageFile
                      ? profileData.imageFile.name
                      : "Choose an image"}
                  </span>
                </label>
              </div>
            </label>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <div className="flex justify-end gap-4 w-full">
            <button
              onClick={handleCloseModal}
              className="text-base sm:text-lg bg-gray-200 text-gray-800 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-gray-300 transition duration-150"
            >
              Cancel
            </button>

            <PrimaryBtn
              name={isUploading ? "Saving..." : "Save Changes"}
              style="w-auto max-w-none"
              onClick={handleSave}
              disabled={isUploading}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {renderProfileHeader()}
      {renderEditProfileModal()}
      <SellerForm
        IsModalOpenForSeller={isModalOpenForSeller}
        handleCloseModalForSeller={handleCloseModalForSeller}
        handleSaveDoc={handleSaveDoc}
        setDocFile={setDocFile}
        isUploading={isUploading}
      />
    </>
  );
};

export default Profile;
