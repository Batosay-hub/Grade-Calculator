/* =========================
   LOGIN SYSTEM
========================= */

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "123") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("gradeSystem").style.display = "block";
  } else {
    alert("Wrong username or password");
  }
});


/* =========================
   GRADE SYSTEM ELEMENTS
========================= */

const form = document.getElementById("studentForm");
const subjectInput = document.getElementById("subjectName");
const gradeInput = document.getElementById("subjectGrade");
const unitsInput = document.getElementById("subjectUnits");
const tableBody = document.getElementById("subjectTableBody");
const averageDisplay = document.getElementById("averageGrade");


/* =========================
   ALLOWED COLLEGE GRADES
========================= */

const allowedGrades = [
  1.00, 1.25, 1.50, 1.75,
  2.00, 2.25, 2.50, 2.75,
  3.00, 4.00, 5.00
];


/* =========================
   LOCAL DATA STORAGE
========================= */

let grades = [];


/* =========================
   REMARKS FUNCTION
========================= */

function getRemarks(g) {
  if (g <= 1.25) return "Excellent";
  if (g <= 1.75) return "Very Good";
  if (g <= 2.25) return "Good";
  if (g <= 2.75) return "Satisfactory";
  if (g <= 3.00) return "Passed";
  if (g === 4.00) return "Conditional / For Removal";
  return "Failed";
}


/* =========================
   VALIDATE GRADE
========================= */

function isValidGrade(grade) {
  return allowedGrades.includes(grade);
}


/* =========================
   ADD SUBJECT
========================= */

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const subject = subjectInput.value.trim();
  const grade = parseFloat(gradeInput.value);
  const units = parseInt(unitsInput.value);

  if (!subject || isNaN(grade) || isNaN(units)) {
    alert("Please complete all fields");
    return;
  }

  if (!isValidGrade(grade)) {
    alert("Invalid grade! Allowed: 1.00, 1.25, ... 4.00, 5.00");
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

  // optional backend save
  try {
    await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, grade, units })
    });
  } catch (err) {
    console.error(err);
  }
});


/* =========================
   DELETE FUNCTION
========================= */

function deleteGrade(id) {
  grades = grades.filter(item => item.id !== id);
  updateTable();
}


/* =========================
   UPDATE TABLE
========================= */

function updateTable() {
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
          <button onclick="deleteGrade(${item.id})" 
            style="background:red;color:white;border:none;padding:5px 10px;cursor:pointer;">
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