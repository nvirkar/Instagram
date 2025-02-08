const multer = require("multer");
const path = require("path");

// Set storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in the 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Set unique file name
  },
});

// Configure multer to handle file uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB size limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed."));
    }
  },
});

// Export multer upload function for use in routes
module.exports = upload;
