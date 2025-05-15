const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

// ─── SIGN UP ────────────────────────────────────────────────────────────────
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required." });
    }
    if (username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters." });
    }
    if (password.length <= 5) {
      return res.status(400).json({ message: "Password must be longer than 5 characters." });
    }

    // Uniqueness checks
    if (await User.findOne({ username })) {
      return res.status(409).json({ message: "Username already exists." });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // Hash + save
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password, address });
    await newUser.save();

    return res.status(201).json({ message: "Sign-up successful." });
  } catch (err) {
    console.error("Sign-up error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// ─── SIGN IN ────────────────────────────────────────────────────────────────
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Received data:", req.body); // Debug log

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, existingUser.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { _id: existingUser._id, username: existingUser.username, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Sign-in successful.",
      existingUser,
      token,
    });
  } catch (err) {
    console.error("Sign-in error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});


// ─── GET USER INFO ─────────────────────────────────────────────────────────
router.get("/get-user-info", authenticateToken, async (req, res) => {
  try {
    // req.user._id comes from the verified token
    const userData = await User.findById(req.user._id).select("-password");
    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(userData);
  } catch (err) {
    console.error("Get-user-info error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});
router.put("/update-address", authenticateToken, async (req, res) => {
    try {
     const {id}= req.headers
      const { address } = req.body;
      await User.findByIdAndUpdate(id,{address:address})
      return res.status(200).json({message:"Adress update"})
    }catch{
        return res.status(500).json({message:"Internal Issue"})

    }
}
)

module.exports = router;
