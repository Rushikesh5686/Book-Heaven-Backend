require('dotenv').config();        // ensure this line only appears once in your top‐level app (e.g. app.js)
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // expect header: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = payload;   // { _id, username, role }
    next();
  });
};

module.exports = { authenticateToken };
