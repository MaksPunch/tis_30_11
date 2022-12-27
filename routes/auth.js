const { Router } = require("express");
const bcrypt = require("bcrypt");
const path = require('path')
const generateTokens = require("../utils/generateTokens.js");
require("dotenv").config();

const router = Router();
const file = path.join('./models/user.json')
const jf = require('jsonfile');

const User = jf.readFileSync(file);

function emailValidate(email) {
    return email.toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

// signup
router.post("/signUp", async (req, res) => {
    try {
        if (!req.body.username) return res.status(400).json({ error: true, message: "username is required" })
        if (!req.body.email) return res.status(400).json({ error: true, message: "email is required" })
        if (!req.body.password) return res.status(400).json({ error: true, message: "password is required" })
        if (!emailValidate(req.body.email)) return res.status(400).json({ error: true, message: "email is not valid" })
        const user = await User.users.find(el => el.email == req.body.email);
        if (user)
            return res
                .status(400)
                .json({ error: true, message: "User with given email already exist" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = {
            id: User.users.length,
            username: req.body.username,
            email: req.body.email,
            password: hashPassword
        }
        User.users.push(newUser)
        jf.writeFile(file, User, {spaces: 2}, (err) => {if (err) throw err})

        res
            .status(201)
            .json({ error: false, message: "Account created sucessfully", user: newUser });
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
        req.session['refreshToken'] = refreshToken;
        res.status(200).json({
            error: false,
            accessToken,
            refreshToken,
            message: "Logged in sucessfully"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

router.get('/profile', (req, res) => {
    try {
        jf.readFile('./models/user.json', (err, obj) => {
            if (err) throw err
            const fileObj = obj;
            let uid = jf.readFileSync('./models/UserToken.json').userToken
                .find(el => el.token == req.session.refreshToken);
            if (uid) uid = uid.userId;
            else return res.status(400).json({error: true, message: "Token Not Found"});
            const user = fileObj.users.find(el => el.id == uid)
            
            return res.status(200).json({
                uid: uid,
                username: user.username,
                email: user.email
            })
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
})

module.exports = router;