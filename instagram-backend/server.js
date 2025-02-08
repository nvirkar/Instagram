require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // Import the database connection

const app = express();
app.use(express.json());
app.use(cors());

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
