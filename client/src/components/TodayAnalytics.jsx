import React, { useState, useEffect } from "react";
import { BookOpen, Users, Heart, Eye, BarChart3, Library } from "lucide-react";

const TodayAnalytics = ({ analyticsData }) => {
    console.log(analyticsData);
  const [analytics, setAnalytics] = useState({
    booksAdded: analyticsData?.booksAdded || 0,
    totalDonations: analyticsData?.totalDonations || 0,
    usersCreated: analyticsData?.usersCreated || 0,
    visits: analyticsData?.visits || 0,
    date: analyticsData?.date || "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (analyticsData && analyticsData.length > 0) {
          setAnalytics(analyticsData[0]);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch analytics data");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div
      className={`
        ${gradient}
        p-6 rounded-xl shadow-xl
        transform transition-all duration-300 hover:-translate-y-2
        backdrop-blur-lg bg-opacity-90
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-lg text-white/80 mb-1">{title}</p>
          <p className="text-4xl font-bold text-white">{value || 0}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="mt-4 bg-white/10 h-1 rounded-full">
        <div className="h-full w-2/3 bg-white/30 rounded-full" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mb-8 overflow-hidden">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            Loading analytics...
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-40 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 overflow-hidden">
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Today's Analytics
        </h2>
        <p className="text-gray-500 text-lg">Statistics for {analytics.date}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Site Visits"
          value={analytics.visits}
          icon={Eye}
          gradient="bg-gradient-to-br from-blue-600 to-blue-400"
        />
        <StatCard
          title="New Books"
          value={analytics.booksAdded}
          icon={BookOpen}
          gradient="bg-gradient-to-br from-purple-600 to-indigo-400"
        />
        <StatCard
          title="New Users"
          value={analytics.usersCreated}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-600 to-teal-400"
        />
        <StatCard
          title="Donations"
          value={analytics.totalDonations}
          icon={Heart}
          gradient="bg-gradient-to-br from-rose-600 to-pink-400"
        />
      </div>
    </div>
  );
};

export default TodayAnalytics;
