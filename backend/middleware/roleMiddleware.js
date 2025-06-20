const roleMiddleware = (roles) => {
  return (req, res, next) => {
    const { role } = req.user.profile;

    if (roles[0] !== role) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    next();
  };
};

module.exports = roleMiddleware;
