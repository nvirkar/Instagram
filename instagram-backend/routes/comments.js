const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");

// Add a comment
router.post("/:post_id/comment", authMiddleware, (req, res) => {
  const { user_id, comment_text } = req.body;
  const { post_id } = req.params;

  db.query(
    "INSERT INTO comments (user_id, post_id, comment_text) VALUES (?, ?, ?)",
    [user_id, post_id, comment_text],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Comment added!" });
    }
  );
});

// Delete a comment
router.delete("/:comment_id", authMiddleware, (req, res) => {
  const { comment_id } = req.params;

  db.query("DELETE FROM comments WHERE id = ?", [comment_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Comment deleted!" });
  });
});

module.exports = router;
