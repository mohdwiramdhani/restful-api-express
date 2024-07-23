import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        res.status(401).json({
            errors: "Unauthorized"
        }).end();
    } else {
        const token = authHeader.replace('Bearer ', '');

        jwt.verify(token, 'secret_key', (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    errors: "Unauthorized"
                });
            }

            const username = decoded.username;
            req.user = { username: username };

            next();
        });
    }
}
