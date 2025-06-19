const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/", async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    checks: {
      database: "unknown",
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
  };

  try {
    await mongoose.connection.db.admin().ping();
    health.checks.database = "connected";
  } catch (error) {
    health.checks.database = "disconnected";
    health.message = "Service Degraded";
  }

  const status = health.message === "OK" ? 200 : 503;
  res.status(status).json(health);
});

module.exports = router;
