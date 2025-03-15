import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React from "react";

const UserDialog = ({ open, onClose, userData }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <p>
          <strong>User Name:</strong> {userData.profile.userName}
        </p>
        <p>
          <strong>Email:</strong> {userData.profile.email}
        </p>
        <p>
          <strong>First Name:</strong> {userData.profile.firstName}
        </p>
        <p>
          <strong>Last Name:</strong> {userData.profile.lastName}
        </p>
        <p>
          <strong>Role:</strong> {userData.profile.role}
        </p>
        <p>
          <strong>Seller Status:</strong> {userData.isSeller.status}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(userData.createdAt).toLocaleDateString()}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
