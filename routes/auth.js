const { Router } = require("express");
const bcrypt = require("bcrypt");
const path = require('path')
const generateTokens = require("../utils/generateTokens.js");
require("dotenv").config();

const router = Router();
const file = path.join('./models/user.json')
const jf = require('jsonfile');

const User = jf.readFileSync(file);

// signup
router.post("/signUp", async (req, res) => {
    try {
        console.log(User)
        const user = await User.users.find(el => el.username == req.body.username);
        if (user)
            return res
                .status(400)
                .json({ error: true, message: "User with given username already exist" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = {
            id: User.users.length,
            username: req.body.username,
            password: hashPassword
        }
        User.users.push(newUser)
        jf.writeFile(file, User, {spaces: 2}, (err) => {if (err) throw err})

        res
            .status(201)
            .json({ error: false, message: "Account created sucessfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// login
router.post("/logIn", async (req, res) => {
    try {
        const user = await User.users.find(el => el.username == req.body.username);
        if (!user)
            return res
                .status(401)
                .json({ error: true, message: "Invalid username or password" });

        const verifiedPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!verifiedPassword)
            return res
                .status(401)
                .json({ error: true, message: "Invalid email or password" });

        const { accessToken, refreshToken } = await generateTokens(user);

        res.status(200).json({
            error: false,
            accessToken,
            refreshToken,
            message: "Logged in sucessfully",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

module.exports = router;