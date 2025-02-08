const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth"); // Import middleware

// Fetch all posts for specific user
router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.id; // The user ID should be correctly set here

  db.query(
    "SELECT following_id FROM follows WHERE follower_id = ?",
    [userId],
    (err, follows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (follows.length === 0) {
        return res.status(200).json([]); // If user follows no one, return empty list
      }

      const followedUserIds = follows.map((follow) => follow.following_id);

      db.query(
        "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.user_id IN (?) ORDER BY posts.created_at DESC",
        [followedUserIds],
        (err, posts) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(posts); // Send the posts of followed users
        }
      );
    }
  );
});

// Create a new post
router.post("/create", authMiddleware, (req, res) => {
  const { user_id, media_url, caption } = req.body;

  db.query(
    "INSERT INTO posts (user_id, media_url, caption) VALUES (?, ?, ?)",
    [user_id, media_url, caption],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Post created successfully!" });
    }
  );
});

// Delete a post
router.delete("/:post_id", authMiddleware, (req, res) => {
  const { post_id } = req.params;

  db.query("DELETE FROM posts WHERE id = ?", [post_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Post deleted successfully!" });
  });
});

module.exports = router;
