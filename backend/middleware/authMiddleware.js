const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleWare = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // Use findById for more direct lookup if 'id' is in the token
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // findById returns a single document or null, not an array
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};

module.exports = authMiddleWare;
