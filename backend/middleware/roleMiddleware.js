const roleMiddleware = (roles) => {
  return (req, res, next) => {
    const { role } = req.user.profile.role;

    if (!roles.includes(role)) {
      return res.status(403).json({ error: "Access Denied" });
    }

    next();
  };
};

module.exports = roleMiddleware;
