import React, { useState, useEffect } from "react";
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
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import { geBookReport } from "@/api/stats";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const getDateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const BookReport = () => {
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

      const response = await geBookReport({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        groupBy,
      });

      if (response.data && response.data.success) {
        setReportData(response.data);
      } else {
        setError("Failed to retrieve book activity report data");
      }
    } catch (error) {
      console.error("Error fetching book activity report:", error);
      setError("An error occurred while fetching the book activity report");
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
    if (
      !reportData ||
      !reportData.timeline ||
      reportData.timeline.length === 0
    ) {
      alert("No data available to download.");
      return;
    }

    const headers = [
      "Period",
      "Books for Sale",
      "Donated Books",
      "Books Sold",
      "Sold Revenue (₹)",
      "Total Books Added",
    ];
    const rows = reportData.timeline.map((item) => [
      item.period,
      item.saleCount,
      item.donationCount,
      item.soldCount,
      item.soldRevenue,
      item.totalCount,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `BookActivityReport_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const timelineChartData = reportData?.timeline
    ? {
        labels: reportData.timeline.map((item) => item.period),
        datasets: [
          {
            label: "Books for Sale",
            data: reportData.timeline.map((item) => item.saleCount),
            backgroundColor: "rgba(136, 132, 216, 0.7)",
            borderColor: "rgb(136, 132, 216)",
            borderWidth: 1,
          },
          {
            label: "Donated Books",
            data: reportData.timeline.map((item) => item.donationCount),
            backgroundColor: "rgba(130, 202, 157, 0.7)",
            borderColor: "rgb(130, 202, 157)",
            borderWidth: 1,
          },
          {
            label: "Books Sold",
            data: reportData.timeline.map((item) => item.soldCount),
            backgroundColor: "rgba(255, 159, 64, 0.7)",
            borderColor: "rgb(255, 159, 64)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const bookDistributionData = reportData?.summary
    ? {
        labels: ["Books for Sale", "Books for Donation"],
        datasets: [
          {
            data: [
              reportData.summary.booksForSale,
              reportData.summary.booksForDonation,
            ],
            backgroundColor: [
              "rgba(136, 132, 216, 0.7)",
              "rgba(130, 202, 157, 0.7)",
            ],
            borderColor: ["rgb(136, 132, 216)", "rgb(130, 202, 157)"],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const inventoryChartData = reportData?.inventory
    ? {
        labels: ["Available", "Sold", "Donated", "Pending"],
        datasets: [
          {
            data: [
              reportData.inventory.available,
              reportData.inventory.sold,
              reportData.inventory.donated,
              reportData.inventory.pending,
            ],
            backgroundColor: [
              "rgba(75, 192, 192, 0.7)",
              "rgba(255, 159, 64, 0.7)",
              "rgba(130, 202, 157, 0.7)",
              "rgba(255, 205, 86, 0.7)",
            ],
            borderColor: [
              "rgb(75, 192, 192)",
              "rgb(255, 159, 64)",
              "rgb(130, 202, 157)",
              "rgb(255, 205, 86)",
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const trendChartData = reportData?.timeline
    ? {
        labels: reportData.timeline.map((item) => item.period),
        datasets: [
          {
            label: "Total Books",
            data: reportData.timeline.map((item) => item.totalCount),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
            fill: true,
          },
        ],
      }
    : null;

  const revenueChartData = reportData?.timeline
    ? {
        labels: reportData.timeline.map((item) => item.period),
        datasets: [
          {
            label: "Sales Revenue",
            data: reportData.timeline.map((item) => item.soldRevenue),
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Activity Report</CardTitle>
          <CardDescription>
            Analyze book listings, donations, sales, and revenue over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={format(startDate, "yyyy-MM-dd")}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  if (!isNaN(selectedDate.getTime())) {
                    setStartDate(selectedDate);
                  }
                }}
                max={format(endDate, "yyyy-MM-dd")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={format(endDate, "yyyy-MM-dd")}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  if (!isNaN(selectedDate.getTime())) {
                    setEndDate(selectedDate);
                  }
                }}
                min={format(startDate, "yyyy-MM-dd")}
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

          {reportData?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Books Added</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.summary.totalBooks}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Total book listings in period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Books for Sale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.summary.booksForSale}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {reportData.summary.totalBooks > 0
                      ? (
                          (reportData.summary.booksForSale /
                            reportData.summary.totalBooks) *
                          100
                        ).toFixed(1) + "% of total"
                      : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Books Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.summary.booksSold}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Books sold in period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Revenue Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(reportData.summary.soldRevenue)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Total sales revenue
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {reportData?.inventory && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Available Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.inventory.available}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {reportData.inventory.total > 0
                      ? (
                          (reportData.inventory.available /
                            reportData.inventory.total) *
                          100
                        ).toFixed(1) + "% of inventory"
                      : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sold Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.inventory.sold}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {reportData.inventory.total > 0
                      ? (
                          (reportData.inventory.sold /
                            reportData.inventory.total) *
                          100
                        ).toFixed(1) + "% of inventory"
                      : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Donated Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.inventory.donated}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {reportData.inventory.total > 0
                      ? (
                          (reportData.inventory.donated /
                            reportData.inventory.total) *
                          100
                        ).toFixed(1) + "% of inventory"
                      : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pending Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.inventory.pending}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {reportData.inventory.total > 0
                      ? (
                          (reportData.inventory.pending /
                            reportData.inventory.total) *
                          100
                        ).toFixed(1) + "% of inventory"
                      : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.inventory.total}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    All books in system
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

          {!loading && reportData && (
            <>
              <div className="flex justify-end mb-4">
                <Button
                  onClick={generateCSV}
                  disabled={
                    !reportData?.timeline || reportData.timeline.length === 0
                  }
                >
                  Download CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Book Activity Timeline
                    </CardTitle>
                    <CardDescription>
                      Books added and sold over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {timelineChartData && (
                        <Bar
                          data={timelineChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                              mode: "index",
                              intersect: false,
                            },
                            scales: {
                              x: {
                                ticks: {
                                  maxRotation: 45,
                                  minRotation: 45,
                                },
                              },
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: "Number of Books",
                                },
                              },
                            },
                            plugins: {
                              tooltip: {
                                enabled: true,
                                mode: "index",
                                intersect: false,
                                backgroundColor: "rgba(17, 24, 39, 0.8)",
                                padding: 12,
                                titleFont: {
                                  size: 14,
                                },
                                bodyFont: {
                                  size: 13,
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Inventory</CardTitle>
                    <CardDescription>
                      Status of all books in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      {inventoryChartData && (
                        <Doughnut
                          data={inventoryChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "bottom",
                              },
                            },
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Sales Revenue Trend
                    </CardTitle>
                    <CardDescription>
                      Revenue from book sales over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {revenueChartData && (
                        <Bar
                          data={revenueChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                              mode: "index",
                              intersect: false,
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  callback: function (value) {
                                    return "₹" + value.toLocaleString("en-IN");
                                  },
                                },
                                title: {
                                  display: true,
                                  text: "Revenue (₹)",
                                },
                              },
                            },
                            plugins: {
                              tooltip: {
                                mode: "index",
                                intersect: false,
                                backgroundColor: "rgba(17, 24, 39, 0.8)",
                                padding: 12,
                                callbacks: {
                                  label: function (context) {
                                    return (
                                      "Revenue: " + formatCurrency(context.raw)
                                    );
                                  },
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      New Books vs. Books Sold
                    </CardTitle>
                    <CardDescription>
                      Comparison of additions vs. sales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {reportData.timeline && (
                        <Line
                          data={{
                            labels: reportData.timeline.map(
                              (item) => item.period
                            ),
                            datasets: [
                              {
                                label: "New Sale Books",
                                data: reportData.timeline.map(
                                  (item) => item.saleCount
                                ),
                                borderColor: "rgba(136, 132, 216, 1)",
                                backgroundColor: "rgba(136, 132, 216, 0.2)",
                                tension: 0.4,
                              },
                              {
                                label: "Books Sold",
                                data: reportData.timeline.map(
                                  (item) => item.soldCount
                                ),
                                borderColor: "rgba(255, 159, 64, 1)",
                                backgroundColor: "rgba(255, 159, 64, 0.2)",
                                tension: 0.4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                              mode: "index",
                              intersect: false,
                            },
                            plugins: {
                              tooltip: {
                                enabled: true,
                                mode: "index",
                                intersect: false,
                                backgroundColor: "rgba(17, 24, 39, 0.8)",
                                padding: 12,
                                titleFont: {
                                  size: 14,
                                  family: "'Inter', sans-serif",
                                },
                                bodyFont: {
                                  size: 13,
                                  family: "'Inter', sans-serif",
                                },
                                borderColor: "rgba(255, 255, 255, 0.1)",
                                borderWidth: 1,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                              },
                            },
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline Details</CardTitle>
                  <CardDescription>
                    Complete breakdown by time period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead className="text-right">
                            Books for Sale
                          </TableHead>
                          <TableHead className="text-right">
                            Donated Books
                          </TableHead>
                          <TableHead className="text-right">
                            Books Sold
                          </TableHead>
                          <TableHead className="text-right">
                            Sales Revenue
                          </TableHead>
                          <TableHead className="text-right">
                            Total Books Added
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.timeline.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.period}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.saleCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.donationCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.soldCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.soldRevenue || 0)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.totalCount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Top Categories - Books for Sale
                    </CardTitle>
                    <CardDescription>
                      Most popular categories for sale listings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Top Categories</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.booksForSale.map((period, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {period.period}
                            </TableCell>
                            <TableCell>{period.count}</TableCell>
                            <TableCell>
                              {period.topCategories.map((cat, i) => (
                                <div key={i} className="text-sm">
                                  {cat.name}: {cat.count}
                                  {i < period.topCategories.length - 1 && ", "}
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Top Categories - Books for Donation
                    </CardTitle>
                    <CardDescription>
                      Most popular categories for donations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Top Categories</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.booksForDonation.map((period, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {period.period}
                            </TableCell>
                            <TableCell>{period.count}</TableCell>
                            <TableCell>
                              {period.topCategories.map((cat, i) => (
                                <div key={i} className="text-sm">
                                  {cat.name}: {cat.count}
                                  {i < period.topCategories.length - 1 && ", "}
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Top Categories - Books Sold
                    </CardTitle>
                    <CardDescription>
                      Most popular categories for sold books
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Top Categories</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.booksSold.map((period, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {period.period}
                            </TableCell>
                            <TableCell>{period.count}</TableCell>
                            <TableCell>
                              {formatCurrency(period.revenue || 0)}
                            </TableCell>
                            <TableCell>
                              {period.topCategories.map((cat, i) => (
                                <div key={i} className="text-sm">
                                  {cat.name}: {cat.count}
                                  {i < period.topCategories.length - 1 && ", "}
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {!loading &&
            (!reportData ||
              !reportData.timeline ||
              reportData.timeline.length === 0) &&
            !error && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No book activity data available for the selected period.
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookReport;
