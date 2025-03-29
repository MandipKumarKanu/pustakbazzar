import React, { useState } from "react";

const provinces = [
  {
    name: "Sudhurpaschim Province",
    towns: ["Biratnagar", "Dharan", "Itahari"],
  },
  { name: "Madhesh Province", towns: ["Janakpur", "Birgunj", "Rajbiraj"] },
  { name: "Bagmati Province", towns: ["Kathmandu", "Lalitpur", "Bhaktapur"] },
  { name: "Gandaki Province", towns: ["Pokhara", "Gorkha", "Baglung"] },
  { name: "Lumbini Province", towns: ["Butwal", "Bhairahawa", "Tansen"] },
  { name: "Karnali Province", towns: ["Surkhet", "Jumla", "Dailekh"] },
  {
    name: "Sudurpashchim Province",
    towns: ["Dhangadhi", "Mahendranagar", "Dadeldhura"],
  },
];

const BillingDetailsModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    town: "",
    landmark: "",
    phone: "",
    email: "",
  });

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value, province: selectedProvince });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onSubmit(formData);
      setFormData({
        firstName: "",
        lastName: "",
        street: "",
        town: "",
        landmark: "",
        phone: "",
        email: "",
      });
    } catch (error) {}
    // onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs  flex items-center justify-center z-50 p-4">
        <div className="bg-greyColor p-8 rounded-2xl shadow-lg max-w-3xl w-full">
          <h2 className="text-3xl font-bold mb-6">Shipping Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Province
                </label>
                <select
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="w-full bg-transparent appearance-none  border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                  required
                >
                  <option value="" disabled>
                    Select Province
                  </option>
                  {provinces.map((province) => (
                    <option key={province.name} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Town/City
                </label>
                <select
                  name="town"
                  value={formData.town}
                  onChange={handleChange}
                  className="w-full bg-transparent appearance-none  border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                  required
                >
                  <option value="" disabled>
                    Select Town/City
                  </option>
                  {provinces
                    .find((province) => province.name === selectedProvince)
                    ?.towns.map((town) => (
                      <option key={town} value={town}>
                        {town}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                required
              />
            </div>
            <div className="flex justify-end mt-4 gap-4">
              <button
                type="button"
                className="px-4 py-2  bg-gray-400  hover:bg-gray-500 cursor-pointer rounded-full text-white text-lg font-bold"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-t from-primaryColor to-secondaryColor rounded-full text-white text-lg font-bold cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default BillingDetailsModal;
