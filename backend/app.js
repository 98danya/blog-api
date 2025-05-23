require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const tagRoutes = require("./routes/tagRoutes");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use("/uploads", express.static("uploads"));


app.use(cors({
  origin: ["http://localhost:5173", "https://danya-digital-diary.netlify.app"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Welcome to the Blog API");
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
