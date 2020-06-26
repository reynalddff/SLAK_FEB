require('express-async-errors');
const checkAuth = async (req, res, next) => {
    const isAuthenticate = req.isAuthenticate();
    try {
        if (isAuthenticate) {
            return next();
        }
    } catch (error) {
        res.status(401).json({
            status: 'failed',
            msg: 'Unauthorized',
        })
    }

}

const auth = {
    checkAuth
};

module.exports = auth;