import React, { useState, useEffect } from "react";
import { getPlatformFeeReport } from "@/api/stats";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Loader2 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const PlatformFeeReport = () => {
  const getDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const [startDate, setStartDate] = useState(getDateDaysAgo(30));
  const [endDate, setEndDate] = useState(new Date());
  const [groupBy, setGroupBy] = useState("monthly");
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      const response = await getPlatformFeeReport({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        groupBy,
      });

      if (response.data && response.data.success) {
        setReportData(response.data.data);
        setSummary(response.data.summary);
      } else {
        setError("Failed to retrieve platform fee report data");
      }
    } catch (error) {
      console.error("Error fetching platform fee report:", error);
      setError("An error occurred while fetching the platform fee report");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const generateCSV = () => {
    if (!reportData || reportData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headers = ["Period", "Total Fees", "Transaction Count", "Average Fee"];
    const rows = reportData.map((item) => [
      item.period,
      item.totalFees,
      item.transactionCount,
      item.averageFee,
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `PlatformFeeReport_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: reportData.map((item) => item.period),
    datasets: [
      {
        label: "Total Fees",
        data: reportData.map((item) => parseFloat(item.totalFees.toFixed(2))),
        backgroundColor: "rgba(136, 132, 216, 0.7)",
        borderColor: "rgb(136, 132, 216)",
        borderWidth: 1,
        yAxisID: "y-axis-1",
      },
      {
        label: "Average Fee",
        data: reportData.map((item) => parseFloat(item.averageFee.toFixed(2))),
        backgroundColor: "rgba(130, 202, 157, 0.7)",
        borderColor: "rgb(130, 202, 157)",
        borderWidth: 1,
        yAxisID: "y-axis-1",
      },
      {
        label: "Transaction Count",
        data: reportData.map((item) => item.transactionCount),
        backgroundColor: "rgba(255, 198, 88, 0.7)",
        borderColor: "rgb(255, 198, 88)",
        borderWidth: 1,
        yAxisID: "y-axis-2",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      "y-axis-1": {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Amount (₹)",
        },
      },
      "y-axis-2": {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Transaction Count",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (["Total Fees", "Average Fee"].includes(context.dataset.label)) {
              label += formatCurrency(context.raw);
            } else {
              label += context.raw;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Fee Report</CardTitle>
          <CardDescription>
            View platform earnings data with custom filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
                max={endDate ? format(endDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
                min={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Group By</label>
              <Select
                value={groupBy}
                onValueChange={(value) => setGroupBy(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="self-end">
              <Button onClick={fetchReportData} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  "Apply Filters"
                )}
              </Button>
            </div>
          </div>

          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Platform Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.totalFees)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Across {summary.totalPeriods} {groupBy} periods
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {summary.totalTransactions}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Fee-generating transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average Fee</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.averageFeePerTransaction)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Per transaction
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && reportData.length > 0 && (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={generateCSV} disabled={loading || reportData.length === 0}>
                  Download CSV
                </Button>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Platform Fee Trends</h3>
                <div className="h-[400px]">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </>
          )}

          {!loading && reportData.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Detailed Report</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Total Fees</TableHead>
                      <TableHead className="text-right">
                        Transaction Count
                      </TableHead>
                      <TableHead className="text-right">Average Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.period}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.totalFees)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.transactionCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.averageFee)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!loading && reportData.length === 0 && !error && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No platform fee data available for the selected period.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformFeeReport;
