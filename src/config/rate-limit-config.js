import rateLimit from 'express-rate-limit';

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: (req, res) => {
        const retryAfter = Math.ceil(res.get('Retry-After') / 60);
        return `Too many login attempts from this IP, please try again after ${retryAfter} minutes.`;
    },
    headers: true,
});

const registerRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
    message: (req, res) => {
        const retryAfter = Math.ceil(res.get('Retry-After') / 60);
        return `Too many registration attempts from this IP, please try again after ${retryAfter} minutes.`;
    },
    headers: true,
});

export { loginRateLimiter, registerRateLimiter };