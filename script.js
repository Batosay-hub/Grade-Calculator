/* =========================
   USERS (LOCAL LOGIN ONLY)
========================= */
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = null;

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
   REGISTER
========================= */
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
   LOGIN
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
    alert("Wrong username or password");
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
   GRADES ARRAY
========================= */
let grades = [];

/* =========================
   ADD GRADE (SAVE TO DB)
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const subject = subjectInput.value.trim();
  const grade = parseFloat(gradeInput.value);
  const units = parseInt(unitsInput.value);

  if (!subject || isNaN(grade) || isNaN(units)) {
    alert("Complete all fields");
    return;
  }

  const newGrade = {
    id: Date.now(),
    subject,
    grade,
    units
  };

  grades.push(newGrade);
  render();

  form.reset();

  try {
    await fetch("https://grade-calculator-s7mr.onrender.com/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
   LOAD GRADES
========================= */
async function loadGrades() {
  try {
    const res = await fetch("https://grade-calculator-s7mr.onrender.com/api/grades");
    const data = await res.json();

    grades = Array.isArray(data) ? data : [];

    render();

  } catch (err) {
    console.log(err);
    grades = [];
  }
}

/* =========================
   DELETE GRADE
========================= */
function deleteGrade(id) {
  grades = grades.filter(g => g.id !== id);
  render();
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
          <button onclick="deleteGrade(${g.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  const gwa = totalUnits > 0
    ? (totalWeighted / totalUnits).toFixed(2)
    : "0.00";

  averageDisplay.textContent = gwa;
}

/* =========================
   AUTO LOGIN
========================= */
if (currentUser) {
  loginBox.style.display = "none";
  gradeSystem.style.display = "block";
  loadGrades();
}