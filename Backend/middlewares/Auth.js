import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    try {
        const { token } = req.cookies;

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