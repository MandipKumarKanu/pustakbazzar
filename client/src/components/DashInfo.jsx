import React, { useState, useEffect } from "react";
import { Mail, Briefcase, TrendingUp, Wallet, Clock } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useAuthStore } from "@/store/useAuthStore";
import { getEarnings, getPayoutHistory } from "@/api/stats";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import DataTable from "./reactTable";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashInfo = () => {
  const [earnings, setEarnings] = useState({
    balance: 0,
    earning: 0,
    payoutHistory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState(null);

  const { user } = useAuthStore();

  const userData = {
    username: user.profile.userName,
    name: `${user.profile.firstName} ${user.profile.lastName}`,
    email: user.profile.email,
    role: user.profile.role,
    imageUrl: user.profile.profileImg || "https://via.placeholder.com/150",
  };

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await getEarnings();
        setEarnings(res?.data?.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch earnings data");
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  useEffect(() => {
    const fetchPayoutHistory = async () => {
      if (!showHistory) return;
      try {
        setPayoutLoading(true);
        const res = await getPayoutHistory(user?._id || user?.id);
        setPayoutHistory(res?.data?.data?.payoutHistory || []);
        setPayoutError(null);
      } catch (err) {
        setPayoutError("Failed to fetch payout history");
      } finally {
        setPayoutLoading(false);
      }
    };

    fetchPayoutHistory();
  }, [showHistory]);

  const chartData = {
    labels: ["Balance", "Earnings"],
    datasets: [
      {
        data: [earnings.balance, earnings.earning],
        backgroundColor: ["#10b981", "#3b82f6"],
        borderColor: ["#10b981", "#3b82f6"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `₹${context.raw}`;
          },
        },
      },
    },
  };

  const totalEarnings = earnings.balance + earnings.earning;
  const balancePercentage = Math.round(
    (earnings.balance / totalEarnings) * 100 || 0
  );
  const earningPercentage = Math.round(
    (earnings.earning / totalEarnings) * 100 || 0
  );

  const columns = [
    {
      header: "Transaction ID",
      accessorKey: "transactionId",
    },
    {
      header: "Amount",
      accessorKey: "payoutAmount",
      cell: (info) => `₹ ${info.getValue()}`,
    },
    {
      header: "Date",
      accessorKey: "payoutDate",
      cell: (info) => format(new Date(info.getValue()), "dd MMM yyyy, hh:mm a"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "success"
                ? "bg-green-100 text-green-800"
                : status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="mb-8 overflow-hidden">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={userData.imageUrl}
                alt={userData.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {userData.name}
              </h3>
              <p className="text-lg text-gray-500">@{userData.username}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="p-3 bg-blue-100 rounded-md">
                <Mail size={24} className="text-blue-500" />
              </div>
              <span className="text-lg text-gray-700 truncate">
                {userData.email}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="p-3 bg-purple-100 rounded-md">
                <Briefcase size={24} className="text-purple-500" />
              </div>
              <span className="text-lg text-gray-700 capitalize">
                {userData.role}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <TrendingUp size={28} className="text-blue-500" />
              Financial Overview
            </h3>
            <Button
              onClick={() => setShowHistory(true)}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading || !!error}
            >
              <Clock size={16} />
              <span>History</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4" />
                <div className="h-5 bg-gray-200 rounded w-32 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 rounded-lg text-center">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="h-56 w-56 relative">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">
                      ₹ {totalEarnings}
                    </span>
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-6">
                <div className="p-4 bg-gray-100 rounded-lg border-l-4 border-green-500 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <Wallet size={20} className="text-green-500" />
                      <span className="font-medium text-gray-700 text-lg">
                        Balance
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {balancePercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">
                      ₹ {earnings.balance}
                    </span>
                    <div className="h-3 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${balancePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-100 rounded-lg border-l-4 border-blue-500 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-blue-500" />
                      <span className="font-medium text-gray-700 text-lg">
                        Earnings
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {earningPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">
                      ₹ {earnings.earning}
                    </span>
                    <div className="h-3 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${earningPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="w-full" style={{ maxWidth: "70vw" }}>
        
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Clock size={20} className="text-blue-500" />
                Payout History
              </DialogTitle>
            </div>
          </DialogHeader>
          {payoutLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : payoutError ? (
            <div className="py-8 text-center text-red-500">{payoutError}</div>
          ) : payoutHistory.length > 0 ? (
            <DataTable
              columns={columns}
              data={payoutHistory}
              customCss="max-h-[60vh]"
            />
          ) : (
            <div className="py-8 text-center text-gray-500">
              No payout history available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashInfo;
