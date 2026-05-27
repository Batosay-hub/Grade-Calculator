const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

/* =========================
   DATABASE
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: "https://grade-calculator-s7mr.onrender.com"
}));

app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   REGISTER (OPTIONAL)
========================= */
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const check = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    await pool.query(
      "INSERT INTO users(username, password) VALUES($1, $2)",
      [username, password]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   LOGIN (NO SESSION - SIMPLE)
========================= */
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid login" });
    }

    res.json({
      success: true,
      username
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   SAVE GRADE
========================= */
app.post("/api/grades", async (req, res) => {
  try {
    const { username, subject, grade, units } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Missing username" });
    }

    await pool.query(
      `INSERT INTO grades (username, subject, grade, units)
       VALUES ($1, $2, $3, $4)`,
      [username, subject, grade, units]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   GET GRADES
========================= */
app.post("/api/grades/get", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Missing username" });
    }

    const result = await pool.query(
      `SELECT * FROM grades
       WHERE username=$1
       ORDER BY id DESC`,
      [username]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Server Running");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});