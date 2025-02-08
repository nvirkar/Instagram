const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");

// Follow a user
router.post("/:following_id/follow", authMiddleware, (req, res) => {
  const { follower_id } = req.body;
  const { following_id } = req.params;

  db.query(
    "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
    [follower_id, following_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User followed!" });
    }
  );
});

// Unfollow a user
router.delete("/:following_id/unfollow", authMiddleware, (req, res) => {
  const { follower_id } = req.body;
  const { following_id } = req.params;

  db.query(
    "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
    [follower_id, following_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User unfollowed!" });
    }
  );
});

module.exports = router;
