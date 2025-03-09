const initiatePayout = async (seller, amount) => {
  console.log(`Initiating payout of ${amount} to seller ${seller._id}`);
  return { success: true, transactionId: "TXN123456" };
};

module.exports = { initiatePayout };
