import React from "react";

const StatusBadge = ({ status, type = "order" }) => {
  let bgColor, textColor;
  
  if (type === "payment") {
    if (status === "pending") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
    } else if (status === "completed") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
    } else {
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
    }
  } else {
    if (status === "pending") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
    } else if (status === "completed") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
    } else if (status === "processing") {
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
    } else if (status === "cancelled") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
    } else {
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
    }
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default StatusBadge;