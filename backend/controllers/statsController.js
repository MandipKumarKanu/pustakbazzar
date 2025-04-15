const Stats = require("../models/StatsEvent");

const getTodayDate = () => {
  const now = new Date();
  return `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
};

const incrementStat = async (field, amount = 1) => {
  const date = getTodayDate();
  await Stats.findOneAndUpdate(
    { date },
    { $inc: { [field]: amount } },
    { upsert: true, new: true }
  );
};

const recordSale = async (amount) => {
  await incrementStat("totalSales", amount);
};

const recordDonation = async () => {
  await incrementStat("totalDonations");
};

const recordBookAdded = async () => {
  await incrementStat("booksAdded");
};

const recordUserSignup = async () => {
  await incrementStat("usersCreated");
};

const recordVisit = async () => {
  await incrementStat("visits");
};

const getAllStats = async (req, res) => {
  try {
    const { n = 7 } = req.query;
    const numDays = parseInt(n);

    const today = new Date();

    const dateStrings = [];
    for (let i = 0; i < numDays; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      dateStrings.push(`${day}-${month}-${year}`);
    }

    const stats = await Stats.find({
      date: { $in: dateStrings },
    })
      .sort({ date: -1 })
      .select("-totalSales");

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch stats" });
  }
};

module.exports = {
  recordSale,
  recordDonation,
  recordBookAdded,
  recordUserSignup,
  recordVisit,
  getAllStats,
};
