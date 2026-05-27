const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

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

    if(existing.rows.length > 0){

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

  } catch(err){

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

    if(result.rows.length === 0){

      return res.status(401).json({
        error: "Invalid Login"
      });

    }

    res.json({
      success: true,
      username: result.rows[0].username
    });

  } catch(err){

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
      (username,subject,grade,units)
      VALUES($1,$2,$3,$4)`,

      [username, subject, grade, units]

    );

    res.json({
      success: true
    });

  } catch(err){

    console.log(err);

    res.status(500).json({
      error: "Server Error"
    });

  }

});

/* =========================
   GET USER GRADES
========================= */

app.get("/api/grades/:username", async (req, res) => {

  try {

    const { username } = req.params;

    const result = await pool.query(

      `SELECT * FROM grades
       WHERE username=$1
       ORDER BY id DESC`,

      [username]

    );

    res.json(result.rows);

  } catch(err){

    console.log(err);

    res.status(500).json({
      error: "Server Error"
    });

  }

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});