import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(404).json({
                success: false,
                message: 'User is not authenticated'
            })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if (!decode) {
            return res.status(404).json({
                success: false,
                message: 'Invalid token'
            })
        }
        req.authUserId = decode.userId;
        console.log(decode);
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export default isAuthenticated;