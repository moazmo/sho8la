const User = require('../models/User');
const { verifyToken } = require('../config/jwt');

// Combined auth + role middleware
const requireRole = (...roles) => async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    const user = await User.findById(decoded.userId).select('role');
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.userId = decoded.userId;
    req.userRole = user.role;

    if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

// Shorthand middlewares
const authOnly = requireRole();
const clientOnly = requireRole('client');
const freelancerOnly = requireRole('freelancer');
const adminOnly = requireRole('admin');
const clientOrAdmin = requireRole('client', 'admin');

module.exports = { requireRole, authOnly, clientOnly, freelancerOnly, adminOnly, clientOrAdmin };
