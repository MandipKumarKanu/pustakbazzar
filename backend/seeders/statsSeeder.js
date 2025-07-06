require("dotenv").config();
const mongoose = require("mongoose");
const StatsEvent = require("../models/StatsEvent");
const connectDB = require("../config/db");

// Generate stats data for the last 30 days
const generateStatsData = () => {
  const stats = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`; // D-M-YYYY format
    
    // Generate realistic random data with some trends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Base multipliers for different days
    const weekendMultiplier = isWeekend ? 0.7 : 1.0;
    const trendMultiplier = 1 + (29 - i) * 0.02; // Slight upward trend over time
    
    stats.push({
      date: dateString,
      totalSales: Math.floor((Math.random() * 50 + 20) * weekendMultiplier * trendMultiplier),
      totalDonations: Math.random() < 0.3 ? 0 : Math.floor((Math.random() * 10 + 5) * weekendMultiplier * trendMultiplier),
      booksAdded: Math.floor((Math.random() * 15 + 8) * weekendMultiplier * trendMultiplier),
      usersCreated: Math.random() < 0.2 ? 0 : Math.floor((Math.random() * 8 + 3) * weekendMultiplier * trendMultiplier),
      visits: Math.floor((Math.random() * 70 + 10) * weekendMultiplier * trendMultiplier),
    });
  }
  
  return stats;
};

// Sample stats data with realistic values (current 2025 data)
const sampleStats = [
  // Recent July 2025 data
  { date: "1-7-2025", totalSales: 45, totalDonations: 8, booksAdded: 12, usersCreated: 6, visits: 42 },
  { date: "2-7-2025", totalSales: 52, totalDonations: 6, booksAdded: 15, usersCreated: 8, visits: 38 },
  { date: "3-7-2025", totalSales: 38, totalDonations: 12, booksAdded: 9, usersCreated: 4, visits: 45 },
  { date: "4-7-2025", totalSales: 67, totalDonations: 15, booksAdded: 18, usersCreated: 12, visits: 52 },
  { date: "5-7-2025", totalSales: 43, totalDonations: 9, booksAdded: 11, usersCreated: 7, visits: 39 },
  { date: "6-7-2025", totalSales: 0, totalDonations: 0, booksAdded: 10, usersCreated: 0, visits: 6 },
  
  // June 2025 historical data
  { date: "25-6-2025", totalSales: 35, totalDonations: 7, booksAdded: 10, usersCreated: 5, visits: 35 },
  { date: "26-6-2025", totalSales: 42, totalDonations: 9, booksAdded: 14, usersCreated: 8, visits: 41 },
  { date: "27-6-2025", totalSales: 28, totalDonations: 0, booksAdded: 8, usersCreated: 3, visits: 29 },
  { date: "28-6-2025", totalSales: 39, totalDonations: 6, booksAdded: 11, usersCreated: 6, visits: 37 },
  { date: "29-6-2025", totalSales: 51, totalDonations: 12, booksAdded: 16, usersCreated: 9, visits: 48 },
  { date: "30-6-2025", totalSales: 44, totalDonations: 8, booksAdded: 12, usersCreated: 7, visits: 42 },
  
  // May 2025 data for more historical context
  { date: "15-5-2025", totalSales: 31, totalDonations: 0, booksAdded: 9, usersCreated: 4, visits: 32 },
  { date: "20-5-2025", totalSales: 48, totalDonations: 11, booksAdded: 13, usersCreated: 8, visits: 46 },
  { date: "25-5-2025", totalSales: 54, totalDonations: 14, booksAdded: 17, usersCreated: 10, visits: 51 },
  { date: "30-5-2025", totalSales: 41, totalDonations: 0, booksAdded: 11, usersCreated: 0, visits: 38 },
];

const seedStats = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB successfully!");

    console.log("Clearing existing stats...");
    await StatsEvent.deleteMany({});
    
    console.log("Generating dynamic stats data...");
    const dynamicStats = generateStatsData();
    
    console.log("Combining sample and dynamic stats...");
    const allStats = [...sampleStats, ...dynamicStats];
    
    // Remove duplicates by date
    const uniqueStats = allStats.filter((stat, index, self) => 
      index === self.findIndex(s => s.date === stat.date)
    );
    
    console.log("Inserting stats data...");
    const insertedStats = await StatsEvent.insertMany(uniqueStats);
    
    console.log(`✅ Successfully inserted ${insertedStats.length} stats entries:`);
    insertedStats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.date} - Sales: ${stat.totalSales}, Donations: ${stat.totalDonations}, Books: ${stat.booksAdded}, Users: ${stat.usersCreated}, Visits: ${stat.visits}`);
    });

    console.log("\n📊 Stats summary:");
    const totalSales = insertedStats.reduce((sum, stat) => sum + stat.totalSales, 0);
    const totalDonations = insertedStats.reduce((sum, stat) => sum + stat.totalDonations, 0);
    const totalBooks = insertedStats.reduce((sum, stat) => sum + stat.booksAdded, 0);
    const totalUsers = insertedStats.reduce((sum, stat) => sum + stat.usersCreated, 0);
    const totalVisits = insertedStats.reduce((sum, stat) => sum + stat.visits, 0);
    
    console.log(`Total Sales: ${totalSales}`);
    console.log(`Total Donations: ${totalDonations}`);
    console.log(`Total Books Added: ${totalBooks}`);
    console.log(`Total Users Created: ${totalUsers}`);
    console.log(`Total Visits: ${totalVisits}`);

    console.log("\n🎉 Stats seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding stats:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

if (require.main === module) {
  seedStats();
}

module.exports = { seedStats, generateStatsData };
