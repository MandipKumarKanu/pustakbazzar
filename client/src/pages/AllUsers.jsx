import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/reactTable";
import { toast } from "sonner";
import getErrorMessage from "@/utils/getErrorMsg";
import { getAllUsers, sellerToApproveApi, sellerToRejectApi } from "@/api/auth";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [sellerToReject, setSellerToReject] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedUser(null);
  };

  const openImageDialog = (imageUrl) => {
    setCurrentImage(imageUrl);
    setIsImageDialogOpen(true);
  };

  const closeImageDialog = () => {
    setIsImageDialogOpen(false);
    setCurrentImage("");
  };

  const openRejectDialog = (userId) => {
    setSellerToReject(userId);
    setIsRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setIsRejectDialogOpen(false);
    setSellerToReject(null);
  };

  const approveSeller = async (userId) => {
    try {
      const response = await sellerToApproveApi(userId);

      toast.success("Seller approved successfully");
      fetchUsers();
      setIsDetailsOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const rejectSeller = async () => {
    if (!sellerToReject) return;

    try {
      const response = await sellerToRejectApi(sellerToReject);

      toast.success("Seller rejected");
      closeRejectDialog();
      fetchUsers();
      setIsDetailsOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    {
      header: "Username",
      accessorKey: "profile.userName",
    },
    {
      header: "Name",
      cell: ({ row }) => {
        const p = row.original.profile;
        return `${p.firstName || ""} ${p.lastName || ""}`;
      },
    },
    {
      header: "Email",
      accessorKey: "profile.email",
    },
    {
      header: "Role",
      accessorKey: "profile.role",
    },
    {
      header: "Seller Status",
      accessorKey: "isSeller.status",
    },
    {
      header: "Actions",
      meta: { noTruncate: true, minWidth: 200 },
      cell: ({ row }) => (
        <div className="">
          <Button
            variant="outline"
            onClick={() => openUserDetails(row.original)}
          >
            See Details
          </Button>
        </div>
      ),
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>

      <DataTable data={users} columns={columns} />

      {isDetailsOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
          <div className="bg-white rounded-lg p-6 shadow-md w-4/5 max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">User Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">
                    Basic Information
                  </h4>
                  <div className="mt-2 border rounded-md p-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Username:</span>
                        <span className="font-medium">
                          {selectedUser.profile?.userName || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium">
                          {`${selectedUser.profile?.firstName || ""} ${
                            selectedUser.profile?.lastName || ""
                          }`}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">
                          {selectedUser.profile?.email || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">
                          {selectedUser.profile?.phNo || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium">
                          {selectedUser.profile?.role || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Seller Information
                  </h4>
                  <div className="mt-2 border rounded-md p-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {selectedUser.isSeller?.status || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">
                          {selectedUser.isSeller?.rating || "0"}
                        </span>
                      </div>
                      {selectedUser.isSeller?.proofDoc && (
                        <div className="mt-2">
                          <p className="text-gray-600 mb-1">Proof Document:</p>
                          <Button
                            variant="link"
                            onClick={() =>
                              openImageDialog(selectedUser.isSeller.proofDoc)
                            }
                            className="text-blue-600 hover:underline p-0 h-auto font-normal"
                          >
                            View Document
                          </Button>
                        </div>
                      )}

                      {selectedUser.isSeller?.status === "applied" && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveSeller(selectedUser._id)}
                          >
                            Approve Seller
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(selectedUser._id)}
                          >
                            Reject Seller
                          </Button>
                        </div>
                      )}

                      {selectedUser.isSeller?.status === "approved" && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(selectedUser._id)}
                          >
                            Reject Seller
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">
                    Account Information
                  </h4>
                  <div className="mt-2 border rounded-md p-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Account ID:</span>
                        <span className="font-medium text-sm">
                          {selectedUser._id}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {formatDate(selectedUser.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {formatDate(selectedUser.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Financial Information
                  </h4>
                  <div className="mt-2 border rounded-md p-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Balance:</span>
                        <span className="font-medium">
                          {selectedUser.balance || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Earnings:</span>
                        <span className="font-medium">
                          {selectedUser.earning || "0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Activity</h4>
                  <div className="mt-2 border rounded-md p-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Books Bought:</span>
                        <span className="font-medium">
                          {selectedUser.bought?.length/2 || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Books Sold:</span>
                        <span className="font-medium">
                          {selectedUser.sold?.length || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Books Donated:</span>
                        <span className="font-medium">
                          {selectedUser.donated?.length || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-600">Saved for Later:</span>
                        <span className="font-medium">
                          {selectedUser.savedForLater?.length || "0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedUser.profile?.profileImg && (
              <div className="mt-4 border rounded-md p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Profile Image
                </h4>
                <div className="flex justify-center">
                  <img
                    src={selectedUser.profile.profileImg}
                    alt="Profile"
                    className="h-48 w-48 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button onClick={closeDetailsModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {isImageDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg p-4 shadow-md max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Document Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeImageDialog}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="flex justify-center items-center bg-gray-100 rounded-md p-4 h-[70vh] overflow-auto">
              <img
                src={currentImage}
                alt="Document Preview"
                className="max-w-full h-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Image+Not+Available";
                }}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={closeImageDialog}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {isRejectDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
          <div className="bg-white rounded-lg p-6 shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Confirm Reject</h3>
            <p className="mb-6">
              Are you sure you want to reject this seller application? This
              action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeRejectDialog}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={rejectSeller}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;
