export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const allowed = roles.map(r => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s). Your role is '${req.user.role}'.`
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin', 'hr', 'hr_officer', 'Admin');
export const requireEmployee = requireRole('employee', 'admin', 'hr');
