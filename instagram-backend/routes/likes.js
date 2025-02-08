const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");
// Like a post
router.post("/:post_id/like", authMiddleware, (req, res) => {
  const { user_id } = req.body;
  const { post_id } = req.params;

  db.query(
    "INSERT INTO likes (user_id, post_id) VALUES (?, ?)",
    [user_id, post_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Post liked!" });
    }
  );
});

// Unlike a post
router.delete("/:post_id/unlike", authMiddleware, (req, res) => {
  const { user_id } = req.body;
  const { post_id } = req.params;

  db.query(
    "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
    [user_id, post_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Post unliked!" });
    }
  );
});

module.exports = router;
