const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_secret_key';

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:17027/mongodbcap', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
/*
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
});
*/

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    classes: { type: [String], default: [] }, 
});


const User = mongoose.model("User", userSchema, "users");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mystudybudyapp@gmail.com',
        pass: 'imfm ogwm mjic tcmk'
    }
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    console.log("Received registration request for username:", username);

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        console.log("User already exists:", existingUser);
        return res.status(400).json({ error: "Username already exists" });
    }

    const verificationToken = jwt.sign({ username }, JWT_SECRET);

    const mailOptions = {
        from: 'Mystudybudyapp@gmail.com',
        to: username,
        subject: 'Email Verification',
        text: `Click the following link to verify your email: http://localhost:3000/verify/${verificationToken}`
    };

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.error("Email verification error:", error);
            return res.status(500).json({ error: "Error sending verification email, invalid email" });
        }
        console.log('Verification email sent:', info.response);

        
        const newUser = new User({ username, password: hashedPassword, verificationToken, classes: [] });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully. Check your email for verification instructions." });
    });
});


app.get("/verify/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { username } = decoded;

        const user = await User.findOneAndUpdate({ username, verificationToken: token }, { $set: { isVerified: true } });
        if (!user) {
            return res.status(400).json({ error: "Invalid verification token" });
        }
        return res.redirect('http://127.0.0.1:5501/login.html');
        /*return res.status(200).json({ message: "Email verification successful. You can now log in." });*/
    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            if (user.isVerified) {
                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
                return res.status(200).json({ message: "Login successful", token });
            } else {
                return res.status(401).json({ error: "Email not verified. Please check your email for verification instructions." });
            }
        } else {
            return res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/addclass", authenticateToken, async (req, res) => {
    const { className } = req.body;

    try {
        const user = req.user; 
        user.classes.push(className);
        await user.save();

        res.status(200).json({ message: "Class added successfully" });
    } catch (error) {
        console.error("Error adding class:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/getclasses", authenticateToken, (req, res) => {
    const user = req.user; 
    res.status(200).json({ classes: user.classes });
});

app.post("/removeclass", authenticateToken, async (req, res) => {
    const { className } = req.body;

    try {
        const user = req.user; 
        const indexToRemove = user.classes.indexOf(className);

        if (indexToRemove !== -1) {
            user.classes.splice(indexToRemove, 1);
            await user.save();
            res.status(200).json({ message: "Class removed successfully" });
        } else {
            res.status(400).json({ error: "Class not found in user's classes" });
        }
    } catch (error) {
        console.error("Error removing class:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

function authenticateToken(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);

        try {
            const user = await User.findOne({ username: decoded.username });
            if (!user) return res.sendStatus(403); 

            req.user = user;
            next();
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
