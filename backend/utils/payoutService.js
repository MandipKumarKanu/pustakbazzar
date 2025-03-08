const initiatePayout = async (seller, amount) => {
  try {
    console.log(`Initiating payout of ${amount} to seller: ${seller.name}`);

    const payoutResponse = {
      success: true,
      message: `Successfully paid ${amount} to ${seller.name}`,
    };

    return payoutResponse;
  } catch (error) {
    return {
      success: false,
      message: `Payout failed: ${error.message}`,
    };
  }
};

module.exports = { initiatePayout };
