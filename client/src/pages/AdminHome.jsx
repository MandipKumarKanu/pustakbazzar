import React, { useEffect, useState } from "react";
import { getStats } from "@/api/stats";
import AnalyticsChart from "@/components/AnalyticsChart";
import DashInfo from "@/components/DashInfo";

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);
  const [chartWidth, setChartWidth] = useState("100%");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setChartWidth("100%");
      } else {
        setChartWidth("90%");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getStats(days);
      if (response.data && Array.isArray(response.data)) {
        setStats(response.data);
        setError(null);
      } else {
        setError("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to fetch analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDaysChange = (newDays) => {
    setDays(newDays);
  };

  return (
    <div className="p-6">
      <DashInfo />
      <div className="w-full">
        <div className=" ">
          <AnalyticsChart
            chartData={stats}
            loading={loading}
            error={error}
            chartWidth={chartWidth}
            onDaysChange={handleDaysChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
