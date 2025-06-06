// --- server.js ---

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3000;

// --- Middleware ---
app.use(cors()); // Allows cross-origin requests (for development)
app.use(express.json()); // Allows server to accept JSON in request bodies
app.use(express.static("public")); // Serves all files in the 'public' folder

// --- Database Setup ---
const db = new sqlite3.Database(
  "./blog.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
    } else {
      console.log("Connected to the SQLite database.");
      // Create the posts table if it doesn't exist
      db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            date TEXT NOT NULL,
            summary TEXT NOT NULL,
            content TEXT NOT NULL
        )`);
    }
  },
);

// --- API ROUTES (CRUD Endpoints) ---

// READ: Get all posts (C**R**UD)
app.get("/api/posts", (req, res) => {
  const sql = "SELECT * FROM posts ORDER BY id DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ posts: rows });
  });
});

// CREATE: Add a new post (**C**RUD)
app.post("/api/posts", (req, res) => {
  const { title, author, date, summary, content } = req.body;
  const sql = `INSERT INTO posts (title, author, date, summary, content) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [title, author, date, summary, content], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Return the newly created post with its new ID
    res.status(201).json({ id: this.lastID, ...req.body });
  });
});

// UPDATE: Modify an existing post (CR**U**D)
app.put("/api/posts/:id", (req, res) => {
  const { title, author, date, summary, content } = req.body;
  const sql = `UPDATE posts SET title = ?, author = ?, date = ?, summary = ?, content = ? WHERE id = ?`;
  db.run(
    sql,
    [title, author, date, summary, content, req.params.id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: "Post updated successfully", changes: this.changes });
    },
  );
});

// DELETE: Remove a post (CRU**D**)
app.delete("/api/posts/:id", (req, res) => {
  const sql = `DELETE FROM posts WHERE id = ?`;
  db.run(sql, req.params.id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Post deleted successfully", changes: this.changes });
  });
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
