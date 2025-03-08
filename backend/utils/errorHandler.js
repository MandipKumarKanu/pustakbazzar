const handleError = (res, error, defaultMessage) => {
  res.status(500).json({
    error: error.message || defaultMessage,
  });
};

module.exports = handleError;
