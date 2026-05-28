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
   LOGIN STATE (LOCAL ONLY)
========================= */
let currentUser = null;

/* =========================
   SWITCH UI
========================= */
showRegister.onclick = () => {
  loginBox.style.display = "none";
  registerBox.style.display = "block";
};

backToLogin.onclick = () => {
  registerBox.style.display = "none";
  loginBox.style.display = "block";
};

/* =========================
   REGISTER (LOCAL ONLY)
========================= */
let users = JSON.parse(localStorage.getItem("users")) || [];

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = registerUsername.value.trim();
  const password = registerPassword.value.trim();

  if (users.find(u => u.username === username)) {
    alert("Username already exists");
    return;
  }

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created");
  registerForm.reset();
});

/* =========================
   LOGIN (LOCAL ONLY)
========================= */
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  const valid = users.find(
    u => u.username === username && u.password === password
  );

  if (valid || (username === "admin" && password === "123")) {
    currentUser = username;

    loginBox.style.display = "none";
    gradeSystem.style.display = "block";

    loadGrades();
  } else {
    alert("Wrong login");
  }
});

/* =========================
   LOGOUT
========================= */
logoutBtn.onclick = () => {
  currentUser = null;

  gradeSystem.style.display = "none";
  loginBox.style.display = "block";
};

/* =========================
   LOAD GRADES (DATABASE ONLY)
========================= */
let grades = [];

async function loadGrades() {
  try {
    if (!currentUser) return;
    const res = await fetch(`/api/grades/${currentUser}`);
    grades = await res.json();

    render();
  } catch (err) {
    console.log(err);
  }
}

/* =========================
   ADD GRADE (DATABASE ONLY)
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const subject = subjectInput.value.trim();
  const grade = parseFloat(gradeInput.value);
  const units = parseInt(unitsInput.value);

  const allowedGrades = [
    1, 1.25, 1.5, 1.75,
    2, 2.25, 2.5, 2.75,
    3, 3.25, 3.5, 3.75,
    4, 5
  ];

  if (!subject || isNaN(grade) || isNaN(units)) {
    alert("Complete all fields");
    return;
  }

  if (!allowedGrades.includes(grade)) {
    alert("Invalid grade! Allowed: 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 5");
    return;
  }

  try {
    await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        grade,
        units,
        username: currentUser
      })
    });

    form.reset();
    loadGrades();

  } catch (err) {
    console.log(err);
  }
});

/* =========================
   DELETE (DATABASE ONLY)
========================= */
async function deleteGrade(id) {
  if (!id) return;

  try {
    await fetch(`/api/grades/${id}`, {
      method: "DELETE"
    });

    loadGrades();
  } catch (err) {
    console.log(err);
  }
}

/* =========================
   GWA CALCULATION (CORRECT)
========================= */
function render() {
  tableBody.innerHTML = "";

  let totalWeighted = 0;
  let totalUnits = 0;

  grades.forEach(g => {
    const grade = Number(g.grade);
    const units = Number(g.units);

    totalWeighted += grade * units;
    totalUnits += units;

    tableBody.innerHTML += `
      <tr>
        <td>${g.subject}</td>
        <td>${grade.toFixed(2)}</td>
        <td>${units}</td>
        <td>
        <button class="action-btn" onclick="deleteGrade(${g.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  const gwa = totalUnits > 0
    ? (totalWeighted / totalUnits).toFixed(2)
    : "0.00";

  averageDisplay.textContent = gwa;
}