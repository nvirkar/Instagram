const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // Import database connection
const authMiddleware = require("../middleware/auth");
require("dotenv").config();

// Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "90d",
  });
};

// Store refresh tokens temporarily (In production, use DB or Redis)
let refreshTokens = [];

// User Registration
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User registered successfully!" });
    }
  );
});

// User Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0)
        return res.status(400).json({ error: "User not found" });

      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword)
        return res.status(400).json({ error: "Invalid credentials" });

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token in database
      db.query(
        "UPDATE users SET refresh_token = ? WHERE id = ?",
        [refreshToken, user.id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // Send refresh token as HTTP-only cookie
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // Set to true in production (requires HTTPS)
            sameSite: "strict",
          });

          res.json({ accessToken });
        }
      );
    }
  );
});

router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ error: "Unauthorized" });

  // Check if the refresh token exists in DB
  db.query(
    "SELECT * FROM users WHERE refresh_token = ?",
    [refreshToken],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0)
        return res.status(403).json({ error: "Forbidden" });

      const user = results[0];

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) return res.status(403).json({ error: "Invalid token" });

          // Generate new access token
          const accessToken = generateAccessToken({ id: user.id });

          res.json({ accessToken });
        }
      );
    }
  );
});
router.post("/logout", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ error: "Unauthorized" });

  // Remove refresh token from DB
  db.query(
    "UPDATE users SET refresh_token = NULL WHERE refresh_token = ?",
    [refreshToken],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.clearCookie("refreshToken"); // Clear refresh token from cookies
      res.json({ message: "Logged out successfully" });
    }
  );
});

router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Extracted from the token

    // 1. Fetch the user's hashed password from DB
    db.query(
      "SELECT password FROM users WHERE id = ?",
      [userId],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const user = results[0];
        if (!user) return res.status(404).json({ error: "User not found" });

        // 2. Verify the old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch)
          return res.status(401).json({ error: "Incorrect old password" });

        // 3. Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update the password in the database
        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, userId],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // 5. Invalidate the old refresh token
            const newRefreshToken = generateRefreshToken(user);

            db.query(
              "UPDATE users SET refresh_token = ? WHERE id = ?",
              [newRefreshToken, userId],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // 6. Generate a new access token
                const newAccessToken = generateAccessToken(user);

                // 7. Send the new tokens to the user
                res.cookie("refreshToken", newRefreshToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "Strict",
                  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                });

                res.json({
                  accessToken: newAccessToken,
                  message: "Password changed successfully!",
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
