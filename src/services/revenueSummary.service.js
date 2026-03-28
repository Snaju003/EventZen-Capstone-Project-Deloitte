const ConvenienceFeeRevenue = require("../models/ConvenienceFeeRevenue");
const { isDatabaseConnected } = require("../utils/database");
const { createHttpError } = require("../utils/httpError");

async function getRevenueSummary() {
  if (!isDatabaseConnected()) {
    throw createHttpError(503, "Revenue tracking is not available");
  }

  const aggregationResult = await ConvenienceFeeRevenue.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$convenienceFee" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  const summary = aggregationResult[0] || { totalRevenue: 0, totalTransactions: 0 };
  const totalRevenue = Number(summary.totalRevenue) || 0;
  const totalTransactions = Number(summary.totalTransactions) || 0;
  const averageFeePerTransaction = totalTransactions > 0
    ? Math.round((totalRevenue / totalTransactions) * 100) / 100
    : 0;

  return {
    totalRevenue,
    totalTransactions,
    averageFeePerTransaction,
  };
}

module.exports = {
  getRevenueSummary,
};
