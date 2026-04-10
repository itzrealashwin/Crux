export const restrictGuest = (req, res, next) => {
  if (req.user && req.user.isGuest) {
    return res.status(403).json({
      success: false,
      message: 'Guest users are not allowed to perform this action. Please sign up to access this feature.',
    });
  }
  next();
};
