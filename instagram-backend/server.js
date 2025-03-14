require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // Import the database connection
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust to match your frontend URL
    credentials: true, // Important if using cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Use cookie-parser middleware
app.use(cookieParser());

// Import Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/likes", require("./routes/likes"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/follow", require("./routes/follow"));
app.use("/api/upload", require("./routes/upload"));

// Root Route
app.get("/", (req, res) => {
  res.send("Instagram Clone API is Running!");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
