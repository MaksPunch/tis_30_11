const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        if (req.user.roles != "admin") return res.status(403).send("Not Admin.");

        next();
    } catch (error) {
        console.log(error)
        res.status(400).send("Invalid token");
    }
}