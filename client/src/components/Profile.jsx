import React, { useState } from "react";
import PrimaryBtn from "./PrimaryBtn";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  FaStar,
  FaRegStar,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import { Cloudinary } from "cloudinary-core";
import { appySeller } from "@/api/auth";
import Badge from "@assets/image/badge.png";

const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUD_NAME,
  secure: true,
});

const Profile = ({ user }) => {
  const { profile } = user;

  const { user: usr } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [IsModalOpenForSeller, setIsModalOpenForSeller] = useState(false);
  const [profileData, setProfileData] = useState({
    name: `${profile.firstName} ${profile.lastName}`,
    phone: profile.phNo || "",
    image: profile.profileImg || "",
    addresses:
      Array.isArray(profile.address) && profile.address.length > 0
        ? profile.address
        : [{ name: "", street: "", city: "", district: "", isDefault: true }],
  });

  const [activeAddressTab, setActiveAddressTab] = useState(
    profileData.addresses.findIndex((addr) => addr.isDefault) !== -1
      ? profileData.addresses.findIndex((addr) => addr.isDefault)
      : 0
  );

  const [docFile, setDocFile] = useState(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleOpenModalForSeller = () => {
    setIsModalOpenForSeller(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleCloseModalForSeller = () => {
    setIsModalOpenForSeller(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddressChange = (e, index) => {
    const { name, value } = e.target;
    const updatedAddresses = [...profileData.addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [name]: value,
    };

    setProfileData((prevData) => ({
      ...prevData,
      addresses: updatedAddresses,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfileData((prevData) => ({
        ...prevData,
        image: imageUrl,
      }));
    }
  };

  const handleRemoveImage = () => {
    setProfileData((prevData) => ({
      ...prevData,
      image: "",
    }));
  };

  const handleAddAddress = () => {
    if (profileData.addresses.length >= 3) return;

    setProfileData((prevData) => ({
      ...prevData,
      addresses: [
        ...prevData.addresses,
        { name: "", street: "", city: "", district: "", isDefault: false },
      ],
    }));

    setActiveAddressTab(profileData.addresses.length);
  };

  const handleRemoveAddress = (index) => {
    if (profileData.addresses.length <= 1) return;

    const updatedAddresses = profileData.addresses.filter(
      (_, i) => i !== index
    );

    if (profileData.addresses[index].isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setProfileData((prevData) => ({
      ...prevData,
      addresses: updatedAddresses,
    }));

    if (activeAddressTab >= updatedAddresses.length) {
      setActiveAddressTab(updatedAddresses.length - 1);
    } else if (activeAddressTab === index) {
      setActiveAddressTab(0);
    }
  };

  const handleSetDefaultAddress = (index) => {
    const updatedAddresses = profileData.addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));

    setProfileData((prevData) => ({
      ...prevData,
      addresses: updatedAddresses,
    }));
  };

  const handleSave = () => {
    console.log("Updated profile data:", profileData);
    handleCloseModal();
  };

  const handleSaveDoc = async () => {
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
  };

  const handleProfDocumentChange = () => {
    console.log("Prof Document Change");
  };

  const navigate = useNavigate();

  const getInitials = () => {
    return `${profile.firstName?.charAt(0) || ""}${
      profile.lastName?.charAt(0) || ""
    }`;
  };

  return (
    <>
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
          {usr?.seller?.status === "approved" && (
            <div className="absolute bottom-2 right-4 w-14 h-14 bg-white rounded-full border-4 border-primaryColor" title="Verified Seller">
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
            {console.log(usr)}
            {usr?.seller?.status !== "approved" && (
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

      {isModalOpen && (
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

              <label className="block">
                <span className="text-lg font-medium">Phone Number</span>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-lg font-medium">Profile Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-2 text-lg"
                />
              </label>

              {/* Address Section */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Addresses</h3>
                  {profileData.addresses.length < 3 && (
                    <button
                      onClick={handleAddAddress}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <FaPlus size={14} /> Add Address
                    </button>
                  )}
                </div>

                {/* Address Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  {profileData.addresses.map((address, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 flex items-center gap-2 ${
                        activeAddressTab === index
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setActiveAddressTab(index)}
                    >
                      <FaMapMarkerAlt size={14} />
                      <span>
                        {address.name || `Address ${index + 1}`}
                        {address.isDefault && (
                          <FaStar
                            size={12}
                            className="ml-1 inline text-yellow-500"
                          />
                        )}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Address Form */}
                {profileData.addresses[activeAddressTab] && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleSetDefaultAddress(activeAddressTab)
                          }
                          className="text-yellow-500 hover:text-yellow-600"
                          title={
                            profileData.addresses[activeAddressTab].isDefault
                              ? "Default address"
                              : "Set as default"
                          }
                        >
                          {profileData.addresses[activeAddressTab].isDefault ? (
                            <FaStar size={18} />
                          ) : (
                            <FaRegStar size={18} />
                          )}
                        </button>
                        <span className="text-sm text-gray-600">
                          {profileData.addresses[activeAddressTab].isDefault
                            ? "Default Address"
                            : "Set as Default"}
                        </span>
                      </div>

                      {profileData.addresses.length > 1 && (
                        <button
                          onClick={() => handleRemoveAddress(activeAddressTab)}
                          className="text-red-500 hover:text-red-600"
                          title="Remove address"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-sm font-medium">
                          Address Name
                        </span>
                        <input
                          type="text"
                          name="name"
                          placeholder="Home, Work, etc."
                          value={
                            profileData.addresses[activeAddressTab].name || ""
                          }
                          onChange={(e) =>
                            handleAddressChange(e, activeAddressTab)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium">
                          Street Address
                        </span>
                        <input
                          type="text"
                          name="street"
                          value={
                            profileData.addresses[activeAddressTab].street || ""
                          }
                          onChange={(e) =>
                            handleAddressChange(e, activeAddressTab)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-sm font-medium">City</span>
                          <input
                            type="text"
                            name="city"
                            value={
                              profileData.addresses[activeAddressTab].city || ""
                            }
                            onChange={(e) =>
                              handleAddressChange(e, activeAddressTab)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>

                        <label className="block">
                          <span className="text-sm font-medium">District</span>
                          <input
                            type="text"
                            name="district"
                            value={
                              profileData.addresses[activeAddressTab]
                                .district || ""
                            }
                            onChange={(e) =>
                              handleAddressChange(e, activeAddressTab)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
      )}

      {IsModalOpenForSeller && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full shadow-lg mx-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold text-gray-900">
                Apply For Seller
              </h2>
              <button
                onClick={handleCloseModalForSeller}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <label className="block">
                <span className="text-lg font-medium">
                  Upload PAN/VAT document
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  // value={docFile}
                  className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-2 text-lg"
                />
              </label>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={handleCloseModalForSeller}
                  className="text-lg bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-150"
                >
                  Cancel
                </button>

                <PrimaryBtn
                  name="Apply"
                  style="max-w-[150px]"
                  onClick={handleSaveDoc}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
