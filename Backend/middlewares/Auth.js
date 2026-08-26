import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers?.authorization) {
            if (req.headers.authorization.startsWith("Bearer ")) {
                token = req.headers.authorization.split(" ")[1];
            } else {
                token = req.headers.authorization;
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'User is not authenticated'
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);

        if (!decode) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        req.authUserId = decode.userId;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

export default isAuthenticated;