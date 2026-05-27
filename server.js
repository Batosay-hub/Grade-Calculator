const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { Pool } = require("pg");

const app = express();

/* =========================
   DATABASE CONNECTION
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
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "grade-secret-key",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(__dirname));

/* =========================
   REGISTER
========================= */
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    await pool.query(
      "INSERT INTO users(username,password) VALUES($1,$2)",
      [username, password]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

/* =========================
   LOGIN (AUTO SESSION)
========================= */
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid Login" });
    }

    // AUTO LOGIN SESSION
    req.session.user = username;

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

/* =========================
   SAVE GRADE (NO USERNAME INPUT)
========================= */
app.post("/api/grades", async (req, res) => {
  try {
    const username = req.session.user;

    if (!username) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const { subject, grade, units } = req.body;

    await pool.query(
      `INSERT INTO grades (username, subject, grade, units)
       VALUES ($1, $2, $3, $4)`,
      [username, subject, grade, units]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

/* =========================
   GET GRADES (AUTO USER)
========================= */
app.get("/api/grades", async (req, res) => {
  try {
    const username = req.session.user;

    if (!username) {
      return res.status(401).json({ error: "Not logged in" });
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
    res.status(500).json({ error: "Server Error" });
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