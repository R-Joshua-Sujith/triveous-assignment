const router = require("express").Router();
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const bcrypt = require("bcrypt")
dotenv.config();

const UserModel = require("../models/User")



router.post("/signup", async (req, res) => {
    const email = req.body.email;
    const user = await UserModel.findOne({ email });
    if (user) {
        return res.status(404).json({ message: 'Account Already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new UserModel({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });

    try {
        const savedUser = await newUser.save();
        res.status(200).json({ message: `Account Created Successfully`, user: savedUser });
    } catch (err) {
        res.status(500).json(err);
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }


        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SEC, { expiresIn: "10m" });

        res.status(200).json({ token, userId: user._id });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }

})

module.exports = router;