const crypto = require('crypto');

if (!process.env.ADMIN_PASSWORD) {
    throw new Error("FATAL: ADMIN_PASSWORD is not set.");
}

const requireAdmin = (req, res, next) => {
    const providedPassword = req.headers['x-admin-password'] || '';
    const correctPassword = process.env.ADMIN_PASSWORD || '';

    // Convert to buffers for constant-time comparison
    const bufProvided = Buffer.from(providedPassword);
    const bufCorrect = Buffer.from(correctPassword);

    // Check length first (to avoid errors in timingSafeEqual), then check content
    if (bufProvided.length === bufCorrect.length && 
        crypto.timingSafeEqual(bufProvided, bufCorrect)) {
        next();
    } else {
        res.status(403).json({ error: "Access Denied" });
    }
};

module.exports = { requireAdmin };