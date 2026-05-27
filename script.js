
/* =========================
   USERS (LOCAL)
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
   API
========================= */
const API = "";

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
registerForm.addEventListener("submit", e => {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (users.find(u => u.username === username)) {
    alert("Username exists");
    return;
  }

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registered!");
  registerForm.reset();

  registerBox.style.display = "none";
  loginBox.style.display = "block";
});

/* =========================
   LOGIN
========================= */
loginForm.addEventListener("submit", e => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const valid = users.find(u => u.username === username && u.password === password);

  if (valid || (username === "admin" && password === "123")) {
    localStorage.setItem("currentUser", username);

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
  localStorage.removeItem("currentUser");
  gradeSystem.style.display = "none";
  loginBox.style.display = "block";
};

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
   GRADES
========================= */
let grades = [];

/* =========================
   ADD GRADE
========================= */
form.addEventListener("submit", async e => {
  e.preventDefault();

  const subject = subjectInput.value.trim();
  const grade = parseFloat(gradeInput.value);
  const units = parseInt(unitsInput.value);

  if (!subject || isNaN(grade) || isNaN(units)) {
    alert("Complete fields");
    return;
  }

  const entry = {
    id: Date.now(),
    subject,
    grade,
    units,
    remarks: getRemarks(grade)
  };

  grades.push(entry);
  updateTable();
  form.reset();

  await fetch("/api/grades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: localStorage.getItem("currentUser"),
      subject,
      grade,
      units
    })
  });
});

/* =========================
   LOAD GRADES
========================= */
async function loadGrades() {
  const res = await fetch("/api/grades/get", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: localStorage.getItem("currentUser")
    })
  });

  grades = await res.json();

  grades = grades.map(g => ({
    ...g,
    remarks: getRemarks(parseFloat(g.grade))
  }));

  updateTable();
}

/* =========================
   DELETE
========================= */
function deleteGrade(id) {
  grades = grades.filter(g => g.id !== id);
  updateTable();
}

/* =========================
   UPDATE + GWA
========================= */
function updateTable() {
  tableBody.innerHTML = "";

  let total = 0;
  let units = 0;

  grades.forEach(g => {
    total += g.grade * g.units;
    units += g.units;

    tableBody.innerHTML += `
      <tr>
        <td>${g.subject}</td>
        <td>${parseFloat(g.grade).toFixed(2)}</td>
        <td>${g.units}</td>
        <td>${g.remarks}</td>
        <td><button onclick="deleteGrade(${g.id})">Delete</button></td>
      </tr>
    `;
  });

  averageDisplay.textContent = units ? (total / units).toFixed(2) : "0.00";
}