// server.js

const express = require("express");
const cors = require("cors");
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
   DATABASE TEST
========================= */

pool.connect()
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((err) => {
    console.log("DATABASE ERROR");
    console.log(err);
  });

/* =========================
   CREATE TABLES
========================= */

async function createTables() {

  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        subject TEXT NOT NULL,
        grade NUMERIC NOT NULL,
        units INT NOT NULL
      );
    `);

    console.log("TABLES READY");

  } catch (err) {

    console.log("TABLE ERROR");
    console.log(err);

  }

}

createTables();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

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

      return res.status(400).json({
        error: "Username already exists"
      });

    }

    await pool.query(
      "INSERT INTO users(username,password) VALUES($1,$2)",
      [username, password]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server Error"
    });

  }

});

/* =========================
   LOGIN
========================= */

app.post("/api/login", async (req, res) => {

  try {

    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (result.rows.length === 0) {

      return res.status(401).json({
        error: "Invalid Login"
      });

    }

    res.json({
      success: true,
      username
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server Error"
    });

  }

});

/* =========================
   SAVE GRADE
========================= */

app.post("/api/grades", async (req, res) => {

  try {

    const {
      username,
      subject,
      grade,
      units
    } = req.body;

    await pool.query(
      `INSERT INTO grades
      (username, subject, grade, units)
      VALUES($1,$2,$3,$4)`,
      [username, subject, grade, units]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server Error"
    });

  }

});

/* =========================
   GET GRADES
========================= */

app.post("/api/grades/get", async (req, res) => {

  try {

    const { username } = req.body;

    const result = await pool.query(
      `SELECT * FROM grades
       WHERE username=$1
       ORDER BY id DESC`,
      [username]
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server Error"
    });

  }

});

/* =========================
   HOME
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