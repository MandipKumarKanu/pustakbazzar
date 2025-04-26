import React, { useEffect, useState } from "react";
import DataTable from "@/components/reactTable";
import { Button } from "@/components/ui/button";
import { getEarningsOfSeller, payEarningsOfSeller } from "@/api/stats";
import { toast } from "sonner";
import { Wallet, History, Coins, RefreshCw } from "lucide-react";
import { formatDate } from "@/hooks/helper";

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
      toast.error("Failed to load seller data");
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePayout = async () => {
    try {
      if (selectedSeller) {
        await payEarningsOfSeller({ sellerId: selectedSeller.sellerId });
        toast.success(`Payout to ${selectedSeller.name} completed successfully`);
        fetchSellers();
        setConfirmationDialogOpen(false);
      }
    } catch (err) {
      console.error("Error initiating payout:", err);
      toast.error("Failed to process payout. Please try again.");
    }
  };

  const confirmPayout = (seller) => {
    setSelectedSeller(seller);
    setConfirmationDialogOpen(true);
  };

  const viewPayoutHistory = (history, seller) => {
    setSelectedSeller(seller);
    setSelectedHistory(history || []);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setDialogOpen(false);
    setSelectedSeller(null);
    setSelectedHistory([]);
  };

  const closeConfirmationModal = () => {
    setConfirmationDialogOpen(false);
    setSelectedSeller(null);
  };

  const columns = [
    {
      header: "Seller Name",
      accessorKey: "name",
    },
    {
      header: "Username",
      accessorKey: "userName",
    },
    {
      header: "Current Balance (₹)",
      accessorKey: "balance",
      cell: ({ row }) => (
        <span className="font-medium text-indigo-700">
          ₹{parseFloat(row.original.balance).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Total Earnings (₹)",
      accessorKey: "totalEarning",
      cell: ({ row }) => (
        <span className="font-medium">
          ₹{parseFloat(row.original.totalEarning).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Actions",
      meta: { noTruncate: true, minWidth: 280 },
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewPayoutHistory(row.original.payoutHistory, row.original)}
            className="px-3 py-1 h-8 bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200 hover:text-indigo-800 rounded"
            disabled={!row.original.payoutHistory?.length}
          >
            <History size={14} className="mr-1" /> View History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => confirmPayout(row.original)}
            className="px-3 py-1 h-8 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 hover:text-emerald-800 rounded"
            disabled={parseFloat(row.original.balance) <= 0}
          >
            <Wallet size={14} className="mr-1" /> Pay Out
          </Button>
        </div>
      ),
    },
  ];

  const getRowClassName = (row) => {
    const balance = parseFloat(row.original.balance);
    return balance > 1000 ? "bg-emerald-50" : balance > 0 ? "bg-blue-50" : "";
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Seller Payouts</h1>
        <Button
          onClick={fetchSellers}
          className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          title="Refresh seller data"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <DataTable 
          data={sellers} 
          columns={columns} 
          isLoading={isLoading} 
          getRowClassName={getRowClassName}
        />
      </div>

      {/* Payout History Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[500px] max-w-full animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <History className="mr-2 text-indigo-600" size={20} /> 
              Payout History for {selectedSeller?.name}
            </h3>
            
            {selectedHistory.length > 0 ? (
              <div className="space-y-3">
                {selectedHistory.map((payout, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-indigo-700">
                        ₹{parseFloat(payout.payoutAmount).toFixed(2)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payout.status === "completed" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>
                        <span className="text-gray-500">Date:</span>{" "}
                        {formatDate(payout.payoutDate)}
                      </p>
                      <p>
                        <span className="text-gray-500">Transaction ID:</span>{" "}
                        <span className="font-mono text-xs">{payout.transactionId}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Coins className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">No payout history available.</p>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payout Modal */}
      {confirmationDialogOpen && selectedSeller && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <Wallet className="mr-2 text-emerald-600" size={20} />
              Confirm Payout
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to initiate a payout for:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="font-medium text-lg mb-1">{selectedSeller.name}</p>
                <p className="text-gray-600 text-sm mb-3">@{selectedSeller.userName}</p>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-emerald-600">₹{parseFloat(selectedSeller.balance).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeConfirmationModal}>
                Cancel
              </Button>
              <Button 
                onClick={initiatePayout}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Wallet size={16} className="mr-1" /> Confirm Payout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayOut;
