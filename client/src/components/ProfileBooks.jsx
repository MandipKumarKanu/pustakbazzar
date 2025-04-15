import MyBookPage from "@/pages/MyBookPage";
import MyOrders from "@/pages/MyOrders";
import React, { useState } from "react";

const ProfileBooks = ({ user }) => {
  const [activeTab, setActiveTab] = useState("bought");

  const tabs = [
    { name: "Bought", value: "bought", count: user?.bought?.length  || 0 },
    { name: "Donated", value: "donated", count: user?.donated?.length || 0 },
  ];

  if (user?.isSeller?.status === "approved") {
    tabs.push({
      name: "Listed by you",
      value: "list",
      count: user?.sold?.length || 0,
    });
  }

  const renderContent = () => {
    switch (activeTab) {
      case "bought":
        return (
          <>
            <MyOrders />
          </>
        );
      case "list":
        return (
          <>
            <MyBookPage isDonation={false} />
          </>
        );
      // case "rented":
      //   return <div>Your rented books will be listed here.</div>;
      case "donated":
        return (
          <>
            <MyBookPage isDonation={true} />
          </>
        );
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
