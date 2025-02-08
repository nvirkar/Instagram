const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  // Check if token exists
  if (!token) {
    return res.status(401).json({ error: "Access Denied! No token provided." });
  }

  try {
    // Remove "Bearer " from the token string
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = verified; // Store user data in request object
    next(); // Move to next middleware
  } catch (err) {
    res.status(403).json({ error: "Invalid or Expired Token" });
  }
};
