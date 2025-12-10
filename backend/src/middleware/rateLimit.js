// Simple in-memory rate limiter (use Redis in production for distributed systems)
const rateLimits = new Map();

const rateLimit = (options = {}) => {
    const { windowMs = 60000, max = 100, message = 'Too many requests' } = options;

    return (req, res, next) => {
        const key = `${req.ip}:${req.path}`;
        const now = Date.now();

        if (!rateLimits.has(key)) {
            rateLimits.set(key, { count: 1, start: now });
            return next();
        }

        const record = rateLimits.get(key);

        if (now - record.start > windowMs) {
            rateLimits.set(key, { count: 1, start: now });
            return next();
        }

        if (record.count >= max) {
            return res.status(429).json({ error: message });
        }

        record.count++;
        next();
    };
};

// Pre-configured limiters
const limiters = {
    auth: rateLimit({ windowMs: 60000, max: 5, message: 'Too many login attempts' }),
    api: rateLimit({ windowMs: 60000, max: 100 }),
    strict: rateLimit({ windowMs: 60000, max: 10, message: 'Rate limit exceeded' })
};

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimits) {
        if (now - record.start > 300000) rateLimits.delete(key);
    }
}, 300000);

module.exports = { rateLimit, limiters };
