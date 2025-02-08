const express = require("express");
const router = express.Router();
const db = require("../db"); // Database connection
const upload = require("../utils/fileUpload"); // Import the file upload logic
const authMiddleware = require("../middleware/auth");

// API Route for image/video upload
router.post("/", authMiddleware, upload.single("file"), (req, res) => {
  const userId = req.user.id; // Get authenticated user ID from the token
  const file = req.file; // File uploaded

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Store file metadata in the database (e.g., file name, size, type, user ID)
  const filePath = `/uploads/${file.filename}`;
  const fileMetadata = {
    user_id: userId,
    file_name: file.filename,
    file_path: filePath,
    file_size: file.size,
    file_type: file.mimetype,
    created_at: new Date(),
  };

  // Insert file metadata into the database
  db.query("INSERT INTO files SET ?", fileMetadata, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "File uploaded successfully!",
      file: fileMetadata,
    });
  });
});

module.exports = router;
