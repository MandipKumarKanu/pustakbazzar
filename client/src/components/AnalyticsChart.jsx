import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Skeleton } from "./ui/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsChart = ({
  chartData,
  loading,
  error,
  chartWidth,
  onDaysChange,
}) => {
  const [processedData, setProcessedData] = useState({
    labels: [],
    datasets: [],
  });
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const sortedData = [...chartData].sort((a, b) => {
        const dateA = new Date(a.date.split("-").reverse().join("-"));
        const dateB = new Date(b.date.split("-").reverse().join("-"));
        return dateB - dateA;
      });

      const labels = sortedData.map((item) => item.date);

      setProcessedData({
        labels,
        datasets: [
          {
            label: "Visits",
            data: sortedData.map((item) => item.visits || 0),
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          // {
          //   label: "Sales",
          //   data: sortedData.map((item) => item.totalSales || 0),
          //   borderColor: "rgb(244, 63, 94)",
          //   backgroundColor: "rgba(244, 63, 94, 0.1)",
          //   fill: true,
          //   tension: 0.4,
          //   pointRadius: 4,
          //   pointHoverRadius: 6,
          // },
          {
            label: "New Users",
            data: sortedData.map((item) => item.usersCreated || 0),
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Donations",
            data: sortedData.map((item) => item.totalDonations || 0),
            borderColor: "rgb(234, 179, 8)",
            backgroundColor: "rgba(234, 179, 8, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Books Added",
            data: sortedData.map((item) => item.booksAdded || 0),
            borderColor: "rgb(168, 85, 247)",
            backgroundColor: "rgba(168, 85, 247, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });
    }
  }, [chartData]);

  const handleTimeRangeChange = (e) => {
    const days = parseInt(e.target.value);
    setTimeRange(days);
    if (onDaysChange) {
      onDaysChange(days);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
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
        displayColors: true,
        intersect: false,
        mode: "index",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
          padding: 10,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
          padding: 10,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="w-full flex justify-center flex-col items-center gap-4 mb-8">
          <Skeleton className="h-8 w-60" />
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-xl">
          <p className="text-red-500 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-end mb-6 pr-32">
        <div className="flex items-center ">
          <label htmlFor="timeRange" className="mr-2 text-gray-600 font-medium">
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={28}>28 Days</option>
          </select>
        </div>
      </div>
      <div
        className="relative w-full "
        style={{
          height: "500px",
          width: chartWidth || "100%",
          margin: "0 auto",
        }}
      >
        <h2 className="text-3xl text-center font-bold text-gray-700">
          Analytics
        </h2>
        <Line options={options} data={processedData} />
      </div>
    </div>
  );
};

export default AnalyticsChart;
