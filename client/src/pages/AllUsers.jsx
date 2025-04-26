import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DataTable from "@/components/reactTable";
import { toast } from "sonner";
import getErrorMessage from "@/utils/getErrorMsg";
import { getAllUsers, sellerToApproveApi, sellerToRejectApi } from "@/api/auth";
import { Eye, FileText, X } from "lucide-react";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [sellerToReject, setSellerToReject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
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
      cell: ({ row }) => {
        const role = row.original.profile?.role;
        return (
          <Badge variant={role === "admin" ? "destructive" : "secondary"}>
            {role || "user"}
          </Badge>
        );
      },
    },
    {
      header: "Seller Status",
      cell: ({ row }) => {
        const status = row.original.isSeller?.status;
        let variant = "outline";

        if (status === "approved") variant = "success";
        else if (status === "applied") variant = "warning";
        else if (status === "rejected") variant = "destructive";

        return status ? (
          <Badge
            variant={variant}
            className={`capitalize ${
              variant === "success"
                ? "bg-green-100 text-green-800"
                : variant === "warning"
                ? "bg-yellow-100 text-yellow-800"
                : variant === "destructive"
                ? "bg-red-100 text-red-800"
                : ""
            }`}
          >
            {status}
          </Badge>
        ) : (
          "-"
        );
      },
    },
    {
      header: "Actions",
      meta: { noTruncate: true, minWidth: 200 },
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => openUserDetails(row.original)}
        >
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </Button>
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

  const renderStatusBadge = (status) => {
    if (!status) return "-";

    let className = "bg-gray-100 text-gray-800";

    if (status === "approved") className = "bg-green-100 text-green-800";
    else if (status === "applied") className = "bg-yellow-100 text-yellow-800";
    else if (status === "rejected") className = "bg-red-100 text-red-800";

    return (
      <Badge
        variant="outline"
        className={`capitalize ${className} px-2 py-1 rounded-md text-xs font-medium`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CardTitle className="text-2xl font-bold text-slate-800">
        Manage Users
      </CardTitle>
      {/* <Card className="border-0 shadow-sm"> */}
        {/* <CardContent className="p-6"> */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              className="rounded-md border shadow-sm"
            />
          )}
        {/* </CardContent> */}
      {/* </Card> */}

      {isDetailsOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 shadow-xl w-4/5 max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">User Profile</h3>
              <Button variant="ghost" size="icon" onClick={closeDetailsModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {selectedUser.profile?.profileImg && (
                  <div className="flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md">
                      <img
                        src={selectedUser.profile.profileImg}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                    <h2 className="mt-3 text-lg font-semibold">
                      {`${selectedUser.profile?.firstName || ""} ${
                        selectedUser.profile?.lastName || ""
                      }`}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selectedUser.profile?.email}
                    </p>
                  </div>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-slate-700">
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Username</span>
                        <span className="text-sm font-medium">
                          {selectedUser.profile?.userName || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Phone</span>
                        <span className="text-sm font-medium">
                          {selectedUser.profile?.phNo || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Role</span>
                        <Badge
                          variant={
                            selectedUser.profile?.role === "admin"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {selectedUser.profile?.role || "-"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-slate-700">
                      Seller Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Status</span>
                        <span>
                          {renderStatusBadge(selectedUser.isSeller?.status)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Rating</span>
                        <span className="flex items-center">
                          {selectedUser.isSeller?.rating || "0"}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-yellow-500 ml-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </span>
                      </div>
                      {selectedUser.isSeller?.proofDoc && (
                        <div className="mt-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() =>
                              openImageDialog(selectedUser.isSeller.proofDoc)
                            }
                          >
                            <FileText className="h-4 w-4" />
                            <span>View Document</span>
                          </Button>
                        </div>
                      )}

                      {selectedUser.isSeller?.status === "applied" && (
                        <div className="mt-4 pt-2 flex gap-2">
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
                        <div className="mt-4 pt-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(selectedUser._id)}
                          >
                            Revoke Seller Status
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-slate-700">
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">
                          Account ID
                        </span>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                          {selectedUser._id}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Created</span>
                        <span className="text-sm font-medium">
                          {formatDate(selectedUser.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">
                          Last Updated
                        </span>
                        <span className="text-sm font-medium">
                          {formatDate(selectedUser.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-slate-700">
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Balance</span>
                        <span className="text-sm font-medium">
                          ₹{selectedUser.balance || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Earnings</span>
                        <span className="text-sm font-medium">
                          ₹{selectedUser.earning || "0"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-slate-700">
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-semibold text-blue-700">
                          {selectedUser.bought?.length || "0"}
                        </p>
                        <p className="text-xs text-blue-600">Books Bought</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-semibold text-green-700">
                          {selectedUser.sold?.length || "0"}
                        </p>
                        <p className="text-xs text-green-600">Books Sold</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-semibold text-amber-700">
                          {selectedUser.donated?.length || "0"}
                        </p>
                        <p className="text-xs text-amber-600">Books Donated</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-semibold text-purple-700">
                          {selectedUser.savedForLater?.length || "0"}
                        </p>
                        <p className="text-xs text-purple-600">
                          Saved for Later
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {isImageDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
          <div className="bg-white rounded-lg p-4 shadow-xl max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-xl font-semibold">Document Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeImageDialog}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex justify-center items-center bg-slate-100 rounded-md p-4 h-[70vh] overflow-auto">
              <img
                src={currentImage}
                alt="Document Preview"
                className="max-w-full h-auto object-contain shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Image+Not+Available";
                }}
              />
            </div>
            <div className="flex justify-end mt-4 pt-2 border-t">
              <Button onClick={closeImageDialog}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {isRejectDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-xl w-96">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Confirm Rejection
            </h3>
            <p className="mb-6 text-slate-600">
              Are you sure you want to reject this seller application? This
              action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={closeRejectDialog}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={rejectSeller}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading-spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #3498db;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ManageUser;
