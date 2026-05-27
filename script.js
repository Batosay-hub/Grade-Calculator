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

/* =========================
   SWITCH PAGES
========================= */

showRegister.addEventListener("click", function () {

  loginBox.style.display = "none";
  registerBox.style.display = "block";

});

backToLogin.addEventListener("click", function () {

  registerBox.style.display = "none";
  loginBox.style.display = "block";

});

/* =========================
   REGISTER
========================= */

registerForm.addEventListener("submit", function (e) {

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

  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created successfully");

  registerForm.reset();

  registerBox.style.display = "none";
  loginBox.style.display = "block";

});

/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", function (e) {

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
    (username === "admin" && password === "123") ||
    validUser
  ) {

    loginBox.style.display = "none";
    gradeSystem.style.display = "block";

  } else {

    alert("Wrong username or password");

  }

});

/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", function () {

  gradeSystem.style.display = "none";
  loginBox.style.display = "block";

});

/* =========================
   GRADE SYSTEM
========================= */

const form = document.getElementById("studentForm");
const subjectInput = document.getElementById("subjectName");
const gradeInput = document.getElementById("subjectGrade");
const unitsInput = document.getElementById("subjectUnits");
const tableBody = document.getElementById("subjectTableBody");
const averageDisplay = document.getElementById("averageGrade");

const allowedGrades = [
  1.00, 1.25, 1.50, 1.75,
  2.00, 2.25, 2.50, 2.75,
  3.00, 4.00, 5.00
];

let grades = [];

/* =========================
   REMARKS
========================= */

function getRemarks(g){

  if(g <= 1.25) return "Excellent";
  if(g <= 1.75) return "Very Good";
  if(g <= 2.25) return "Good";
  if(g <= 2.75) return "Satisfactory";
  if(g <= 3.00) return "Passed";
  if(g === 4.00) return "Conditional";
  return "Failed";

}

/* =========================
   VALIDATION
========================= */

function isValidGrade(grade){

  return allowedGrades.includes(grade);

}

/* =========================
   ADD SUBJECT
========================= */

form.addEventListener("submit", function(e){

  e.preventDefault();

  const subject = subjectInput.value.trim();
  const grade = parseFloat(gradeInput.value);
  const units = parseInt(unitsInput.value);

  if(!subject || isNaN(grade) || isNaN(units)){

    alert("Complete all fields");
    return;

  }

  if(!isValidGrade(grade)){

    alert("Invalid Grade");
    return;

  }

  grades.push({
    id: Date.now(),
    subject,
    grade,
    units,
    remarks: getRemarks(grade)
  });

  updateTable();

  form.reset();

});

/* =========================
   DELETE
========================= */

function deleteGrade(id){

  grades = grades.filter(item => item.id !== id);

  updateTable();

}

/* =========================
   UPDATE TABLE
========================= */

function updateTable(){

  tableBody.innerHTML = "";

  let total = 0;

  grades.forEach(item => {

    total += item.grade;

    tableBody.innerHTML += `
      <tr>
        <td>${item.subject}</td>
        <td>${item.grade.toFixed(2)}</td>
        <td>${item.units}</td>
        <td>${item.remarks}</td>
        <td>
          <button
            onclick="deleteGrade(${item.id})"
            class="delete-btn">
            Delete
          </button>
        </td>
      </tr>
    `;

  });

  const avg = grades.length
    ? (total / grades.length).toFixed(2)
    : "0.00";

  averageDisplay.textContent = avg;

}