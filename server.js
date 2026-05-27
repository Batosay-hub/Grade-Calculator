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
   TRUST PROXY (IMPORTANT FOR RENDER)
========================= */
app.set("trust proxy", 1);

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: "https://grade-calculator-s7mr.onrender.com",
  credentials: true
}));

app.use(express.json());

/* SESSION FIXED FOR RENDER */
app.use(session({
  secret: "grade-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "none"
  }
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
   LOGIN (SETS SESSION)
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

    req.session.user = username;

    res.json({
      success: true,
      username
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

/* =========================
   SAVE GRADE (SESSION BASED)
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
   GET GRADES (SESSION BASED)
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