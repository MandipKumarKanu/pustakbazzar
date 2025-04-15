import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "@/components/reactTable";
import { customAxios } from "@/config/axios";
import UserDialog from "@/components/UserDialog";
import { Button } from "@/components/ui/button";
// import UserDialog from "@/components/UserDialog";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    try {
      setIsLoading(true);
      const response = await customAxios.get(`auth/users`);
      setUsers(response.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = (userId) => {
    console.log("Toggling status for user:", userId);
  };

  const deleteUser = (userId) => {
    console.log("Deleting user:", userId);
  };

  const openUserDialog = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const columns = [
    {
      header: "User Name",
      accessorKey: "profile.userName",
      meta: { minWidth: 150 },
    },
    {
      header: "Name",
      accessorKey: "profile.firstName",
      meta: { minWidth: 150 },
    },
    {
      header: "Seller Status",
      accessorKey: "isSeller.status",
      meta: { minWidth: 130 },
    },
    {
      header: "Role",
      accessorKey: "profile.role",
      meta: { minWidth: 120 },
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      meta: { minWidth: 120 },
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    },
    {
      header: "Actions",
      meta: { noTruncate: true, minWidth: 250 },
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button onClick={() => openUserDialog(row.original)}>
            View Details
          </Button>
          <Button onClick={() => toggleUserStatus(row.original._id)}>
            Toggle Status
          </Button>
          <Button onClick={() => deleteUser(row.original._id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto mt-5">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <DataTable columns={columns} data={users} />
      {selectedUser && (
        <UserDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          userData={selectedUser}
        />
      )}
    </div>
  );
};

export default UserPage;
