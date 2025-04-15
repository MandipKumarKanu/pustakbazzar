import React, { useEffect, useState } from "react";
import { customAxios } from "@/config/axios";
import DataTable from "@/components/reactTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEarningsOfSeller, payEarningsOfSeller } from "@/api/stats";

const PayOut = () => {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      const res = await getEarningsOfSeller();
      setSellers(res.data.sellers);
    } catch (err) {
      console.error("Error fetching sellers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePayout = async () => {
    try {
      if (selectedSeller) {
        await payEarningsOfSeller({ sellerId: selectedSeller.sellerId });
        fetchSellers();
        setConfirmationDialogOpen(false);
      }
    } catch (err) {
      console.error("Error initiating payout:", err);
    }
  };

  const confirmPayout = (seller) => {
    setSelectedSeller(seller);
    setConfirmationDialogOpen(true);
  };

  const viewPayoutHistory = (history) => {
    setSelectedHistory(history);
    setDialogOpen(true);
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Username",
      accessorKey: "userName",
    },
    {
      header: "Balance",
      accessorKey: "balance",
    },
    {
      header: "Total Earning",
      accessorKey: "totalEarning",
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex">
          <Button onClick={() => confirmPayout(row.original)}>
            Initiate Payout
          </Button>
        </div>
      ),
    },
  ];

  // const rowClassName = (row) => {
  //   const balance = row.original.balance;
  //   return balance > 0 ? "bg-red-100" : "bg-green-100";
  // };

  return (
    <div className="container mx-auto mt-5">
      <h1 className="text-2xl font-bold mb-4">Seller Payouts</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={sellers}
          // getRowClassName={rowClassName}
        />
      )}

      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payout</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Are you sure you want to initiate a payout for{" "}
            <strong>{selectedSeller?.name}</strong> with a balance of{" "}
            <strong>₹{selectedSeller?.balance}</strong>?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setConfirmationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={initiatePayout}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payout History</DialogTitle>
          </DialogHeader>
          {selectedHistory.length > 0 ? (
            <ul className="space-y-2">
              {selectedHistory.map((payout, index) => (
                <li
                  key={index}
                  className="p-2 border rounded shadow-sm bg-white"
                >
                  <p>
                    <strong>Amount:</strong> {payout.payoutAmount}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(payout.payoutDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Transaction ID:</strong> {payout.transactionId}
                  </p>
                  <p>
                    <strong>Status:</strong> {payout.status}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No payout history available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayOut;
