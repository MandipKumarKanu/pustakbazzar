import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { getSalesPerformanceReport } from "@/api/stats";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const SalesPerformanceReport = () => {
  const getDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const [startDate, setStartDate] = useState(getDateDaysAgo(30));
  const [endDate, setEndDate] = useState(new Date());
  const [groupBy, setGroupBy] = useState("monthly");
  const [reportData, setReportData] = useState(null);
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

      const response = await getSalesPerformanceReport({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        group: groupBy,
      });

      if (response.data && response.data.success) {
        setReportData(response.data.data);
      } else {
        setError("Failed to retrieve sales performance report data");
      }
    } catch (error) {
      console.error("Error fetching sales performance report:", error);
      setError("An error occurred while fetching the sales performance report");
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = () => {
    if (!reportData || !reportData.timeSeriesData) {
      alert("No data available to download.");
      return;
    }

    const headers = ["Period", "Order Count", "Total Revenue", "Items Sold"];
    const rows = reportData.timeSeriesData.map((item) => [
      item.period,
      item.orderCount,
      item.totalRevenue.toFixed(2),
      item.itemsSold,
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `SalesPerformanceReport_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: reportData?.timeSeriesData.map((item) => item.period) || [],
    datasets: [
      {
        label: "Order Count",
        data: reportData?.timeSeriesData.map((item) => item.orderCount) || [],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        yAxisID: "y-axis-1", 
      },
      {
        label: "Items Sold",
        data: reportData?.timeSeriesData.map((item) => item.itemsSold) || [],
        backgroundColor: "rgba(255, 206, 86, 0.7)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
        yAxisID: "y-axis-1", 
      },
      {
        label: "Total Revenue",
        data: reportData?.timeSeriesData.map((item) => item.totalRevenue) || [],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
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
          text: "Order Count / Items Sold",
        },
      },
      "y-axis-2": {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Total Revenue (₹)",
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
            if (context.dataset.label === "Total Revenue") {
              label += `₹${context.raw.toFixed(2)}`;
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
          <CardTitle>Sales Performance Report</CardTitle>
          <CardDescription>
            View sales performance data with custom filters
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
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
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

          {!loading && reportData && (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={generateCSV} disabled={loading || !reportData}>
                  Download CSV
                </Button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Time Series Data</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Order Count</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                        <TableHead className="text-right">Items Sold</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.timeSeriesData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell className="text-right">{item.orderCount}</TableCell>
                          <TableCell className="text-right">
                            {item.totalRevenue.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">{item.itemsSold}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Sales Trends</h3>
                <div className="h-[400px]">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPerformanceReport;