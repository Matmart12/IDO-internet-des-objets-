module.exports = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send('Non autorisé');
    }
    next();
};