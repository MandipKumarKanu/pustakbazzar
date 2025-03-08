const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const validateKhaltiKey = (req, res, next) => {
  if (!KHALTI_SECRET_KEY) {
    return res.status(500).json({
      error: "Khalti secret key is not configured",
    });
  }
  next();
};

module.exports = validateKhaltiKey;
