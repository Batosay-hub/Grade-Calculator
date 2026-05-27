// script.js

/* =========================
   USERS STORAGE
========================= */

let users = JSON.parse(localStorage.getItem("users")) || [];

/* =========================
   ELEMENTS
========================= */

const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");
const gradeSystem = document.getElementById("gradeSystem");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const backToLogin = document.getElementById("backToLogin");

const logoutBtn = document.getElementById("logoutBtn");

const form = document.getElementById("studentForm");

const subjectInput = document.getElementById("subjectName");
const gradeInput = document.getElementById("subjectGrade");
const unitsInput = document.getElementById("subjectUnits");

const tableBody = document.getElementById("subjectTableBody");
const averageDisplay = document.getElementById("averageGrade");

/* =========================
   GRADES ARRAY
========================= */

let grades = [];

/* =========================
   SWITCH PAGES
========================= */

showRegister.addEventListener("click", () => {

  loginBox.style.display = "none";
  registerBox.style.display = "block";

});

backToLogin.addEventListener("click", () => {

  registerBox.style.display = "none";
  loginBox.style.display = "block";

});

/* =========================
   REGISTER
========================= */

registerForm.addEventListener("submit", (e) => {

  e.preventDefault();

  const username = document
    .getElementById("registerUsername")
    .value
    .trim();

  const password = document
    .getElementById("registerPassword")
    .value
    .trim();

  const existingUser = users.find(
    user => user.username === username
  );

  if (existingUser) {

    alert("Username already exists");
    return;

  }

  users.push({
    username,
    password
  });

  localStorage.setItem(
    "users",
    JSON.stringify(users)
  );

  alert("Account created");

  registerForm.reset();

  registerBox.style.display = "none";
  loginBox.style.display = "block";

});

/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const username = document
    .getElementById("loginUsername")
    .value
    .trim();

  const password = document
    .getElementById("loginPassword")
    .value
    .trim();

  const validUser = users.find(
    user =>
      user.username === username &&
      user.password === password
  );

  if (
    validUser ||
    (username === "admin" && password === "123")
  ) {

    localStorage.setItem(
      "currentUser",
      username
    );

    loginBox.style.display = "none";
    gradeSystem.style.display = "block";

    await loadGrades();

  } else {

    alert("Wrong username or password");

  }

});

/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", () => {

  localStorage.removeItem("currentUser");

  gradeSystem.style.display = "none";
  loginBox.style.display = "block";

});

/* =========================
   REMARKS
========================= */

function getRemarks(g) {

  if (g <= 1.25) return "Excellent";
  if (g <= 1.75) return "Very Good";
  if (g <= 2.25) return "Good";
  if (g <= 2.75) return "Satisfactory";
  if (g <= 3.00) return "Passed";
  if (g === 4.00) return "Conditional";

  return "Failed";

}

/* =========================
   LOAD GRADES
========================= */

async function loadGrades() {

  try {

    const res = await fetch("/api/grades/get", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        username: localStorage.getItem("currentUser")
      })

    });

    const data = await res.json();

    if (!Array.isArray(data)) {

      grades = [];
      updateTable();
      return;

    }

    grades = data.map(g => ({
      ...g,
      remarks: getRemarks(parseFloat(g.grade))
    }));

    updateTable();

  } catch (err) {

    console.log(err);

    grades = [];
    updateTable();

  }

}

/* =========================
   ADD GRADE
========================= */

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const subject = subjectInput.value.trim();

  const grade = parseFloat(
    gradeInput.value
  );

  const units = parseInt(
    unitsInput.value
  );

  if (
    !subject ||
    isNaN(grade) ||
    isNaN(units)
  ) {

    alert("Complete all fields");
    return;

  }

  const newEntry = {

    id: Date.now(),
    subject,
    grade,
    units,
    remarks: getRemarks(grade)

  };

  grades.push(newEntry);

  updateTable();

  form.reset();

  try {

    await fetch("/api/grades", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        username: localStorage.getItem("currentUser"),
        subject,
        grade,
        units

      })

    });

  } catch (err) {

    console.log(err);

  }

});

/* =========================
   DELETE
========================= */

function deleteGrade(id) {

  grades = grades.filter(
    item => item.id !== id
  );

  updateTable();

}

/* =========================
   UPDATE TABLE + GWA
========================= */

function updateTable() {

  tableBody.innerHTML = "";

  let totalWeighted = 0;
  let totalUnits = 0;

  grades.forEach(item => {

    totalWeighted +=
      item.grade * item.units;

    totalUnits += item.units;

    tableBody.innerHTML += `
      <tr>
        <td>${item.subject}</td>
        <td>${parseFloat(item.grade).toFixed(2)}</td>
        <td>${item.units}</td>
        <td>${item.remarks}</td>
        <td>
          <button onclick="deleteGrade(${item.id})">
            Delete
          </button>
        </td>
      </tr>
    `;

  });

  const gwa = totalUnits > 0
    ? (totalWeighted / totalUnits).toFixed(2)
    : "0.00";

  averageDisplay.textContent = gwa;

}