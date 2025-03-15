import React, { useState } from "react";

const ProfileBooks = ({ user }) => {
  const [activeTab, setActiveTab] = useState("bought");

  const tabs = [
    { name: "Bought", value: "bought", count: user?.purchased || 0 },
    // { name: "Rented", value: "rented", count: user?.rented || 0 },
    { name: "Donated", value: "donated", count: user?.donated || 0 },
  ];

  if (user?.seller?.status === "approved") {
    tabs.push({ name: "Listed by you", value: "list", count: user?.sold || 0 });
  }

  const renderContent = () => {
    switch (activeTab) {
      case "bought":
        return <div>Your bought books will be listed here.</div>;
      case "list":
        return <div>Your sold books will be listed here.</div>;
      // case "rented":
      //   return <div>Your rented books will be listed here.</div>;
      case "donated":
        return <div>Your donated books will be listed here.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="m-auto max-w-[1500px] mt-14">
      <ul className="flex m-auto max-w-[1300px] justify-between items-center gap-20">
        {tabs.map((tab) => (
          <li
            key={tab.value}
            className={`flex flex-col justify-between items-center border-b-[6px] pb-3 ${
              activeTab === tab.value
                ? "border-b-primaryColor"
                : "border-b-gray-200"
            } rounded-t-lg w-1/4 cursor-pointer`}
            onClick={() => setActiveTab(tab.value)}
          >
            <span className="font-inter font-bold text-xl">{tab.name}</span>
            <span>{tab.count}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">{renderContent()}</div>
    </div>
  );
};

export default ProfileBooks;
