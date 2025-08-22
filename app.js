const supabaseUrl = "https://blkxlczwjkjgdfixbide.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsa3hsY3p3amtqZ2RmaXhiaWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzA3NDcsImV4cCI6MjA2ODQwNjc0N30.z6vZxMuPTvTn7ShSexmSo9C5gGJpl4AvJCSBknIDOZc";

const client = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
let adminEmail = document.getElementById("adminEmail");
let adminPassword = document.getElementById("adminPassword");
let adminLogin = document.getElementById("adminLogin");
let studentForm = document.getElementById("studentForm");
let dashboard = document.getElementById("showData");
const logoutBtn = document.getElementById("logout");

const inputStd = document.getElementById("stdInput");
const checkStd = document.getElementById("student_btn");
let inputValue = document.getElementById("searchInput");

// ========================== Student Form Submit ==========================
if (studentForm) {
  const full_name = document.getElementById("name");
  const email = document.getElementById("email");
  const courses = document.getElementById("courses");
  const age = document.getElementById("age");
  const gender = document.getElementById("gender");
  const cnic = document.getElementById("cnic");
  const contact = document.getElementById("contact");

  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoader();

    if (
      !full_name.value ||
      !email.value ||
      !courses.value ||
      !age.value ||
      !gender.value ||
      !cnic.value ||
      !contact.value
    ) {
      hideLoader();
      Swal.fire("Error", "Please fill all fields", "warning");
      return;
    }

    const { data: lastRoll, error: rollError } = await client
      .from("student_form")
      .select("roll_num")
      .order("roll_num", { ascending: false })
      .limit(1);

    let newRoll = 1001; // default
    if (!rollError && lastRoll && lastRoll.length > 0) {
      newRoll = (lastRoll[0].roll_num || 1000) + 1;
    }

    console.log("Next roll number:", newRoll);
    const { error } = await client.from("student_form").insert({
      full_name: full_name.value,
      email: email.value,
      courses: courses.value,
      age: age.value,
      gender: gender.value,
      roll_num: newRoll,
      cnic: cnic.value,
      contact: contact.value,
    });

    hideLoader();

    if (error) {
      console.log(error.message);
      Swal.fire("Error", "Failed to submit data", "error");
    } else {
      Swal.fire("Success", "Data successfully submitted!", "success");
      // Reset fields
    }
  });
}

// ========================== Admin Login ==========================
if (adminLogin) {
  adminLogin.addEventListener("click", async (e) => {
    e.preventDefault();
    showLoader();

    if (!adminEmail.value || !adminPassword.value) {
      hideLoader();
      Swal.fire("Warning", "Please enter email and password", "warning");
      return;
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: adminEmail.value,
      password: adminPassword.value,
    });

    hideLoader();

    if (error) {
      console.log(error.message);
      Swal.fire("Error", "Invalid admin credentials", "error");
    } else {
      Swal.fire("Success", "Admin successfully logged in", "success").then(
        () => {
          window.location.href = "dashboard.html";
        }
      );
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    showLoader();
    const { error } = await client.auth.signOut();
    hideLoader();

    if (error) {
      Swal.fire("Error", error.message, "error");
    } else {
      Swal.fire("Logged Out", "You have been logged out!", "success");
      window.location.href = "admin.html";
    }
  });
}

// Loader show/hide functions
function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

async function checkAuth() {
  const {
    data: { session },
  } = await client.auth.getSession();
  const currentPage = window.location.pathname.split("/").pop();

  if (!session && currentPage === "dashboard.html") {
    window.location.href = "admin.html";
  }
}

const currentPage = window.location.pathname.split("/").pop();
if (currentPage === "dashboard.html" || currentPage === "admin.html") {
  checkAuth();
}

let array = [
  {
    title: "Total Students",
    value: 50,
    iconClass: "fas fa-users",
    iconColor: "card-icon students",
  },
  {
    title: "Pending Request",
    value: 10,
    iconClass: "fas fa-clock",
    iconColor: "card-icon pending",
  },
  {
    title: "Approved",
    value: 5,
    iconClass: "fas fa-check",
    iconColor: "card-icon approved",
  },

  {
    title: "Rejected",
    value: 4,
    iconClass: "fas fa-times-circle",
    iconColor: "card-icon rejected",
  },
];

// ========================== Load Student Dashboard ==========================
async function showDashboard() {
  if (!dashboard) return;

  let cardShow = document.querySelector(".card-container");
  // console.log(cardShow);

  array.forEach((element) => {
    cardShow.innerHTML += `<div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${element.title}</div>
                        <div class="card-value">${element.value}</div>
                    </div>
                    <div class="${element.iconColor}">
                        <i class="${element.iconClass}"></i>
                    </div>
                </div>
            </div> `;
  });

  const { data, error } = await client.from("student_form").select("*");
  if (error) {
    console.log(error.message);
    return;
  }

  dashboard.innerHTML = ""; // clear old data
  data.forEach((element) => {
    dashboard.innerHTML += `
                <tr>
                  <td>${element.full_name}</td>
                  <td>${element.email}</td>
                  <td>${element.courses}</td>
                  <td>${element.age}</td>
                  <td>${element.gender}</td>
                  <td>${element.roll_num}</td>
                  <td>${element.cnic}</td>
                  <td>${element.contact}</td>
                  <td>
                    <select onchange="statusVa(this.value, ${element.id})">
                      <option disabled selected>${
                        element.status || "Select"
                      }</option>
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </select>
                  </td>
                </tr>
              `;
  });
}
showDashboard();

function checkStudentData() {
  window.location.href = "checkstd.html";
}

// ========================== Status Update ==========================
async function statusVa(statusValue, std_id) {
  const { error } = await client
    .from("student_form")
    .update({ status: statusValue })
    .eq("id", std_id);

  if (error) {
    console.error(error.message);
    Swal.fire("Error", "Status update failed", "error");
    return;
  }

  Swal.fire("Updated!", "Student status has been updated.", "success");
}

let statusFilter = document.getElementById("statusFilter");

async function selectFilter() {
  const { data, error } = await client.from("student_form").select("*");
  if (error) {
    console.log(error.message);
    return;
  }

  let statusFilterValue = statusFilter.value;

  let filtered = data.filter((element) => {
    return statusFilterValue === "all" || element.status === statusFilterValue;
  });

  dashboard.innerHTML = "";
  filtered.forEach((element) => {
    dashboard.innerHTML += `
                <tr>
                  <td>${element.full_name}</td>
                  <td>${element.email}</td>
                  <td>${element.courses}</td>
                  <td>${element.age}</td>
                  <td>${element.gender}</td>
                  <td>${element.roll_num}</td>
                  <td>${element.cnic}</td>
                  <td>${element.contact}</td>
                  <td>
                    <select onchange="statusVa(this.value, ${element.id})">
                      <option disabled selected>${
                        element.status || "Select"
                      }</option>
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </select>
                  </td>
                </tr>
              `;
  });
}

if (statusFilter) {
  statusFilter.addEventListener("change", selectFilter);
}

// 🔍 Input-based search
if (inputValue) {
  inputValue.addEventListener("keyup", async () => {
    const { data, error } = await client.from("student_form").select("*");
    if (error) {
      console.log(error.message);
      return;
    }
    let searchValue = inputValue.value.toLowerCase();
    dashboard.innerHTML = "";

    let matchFound = false;

    data.forEach((element) => {
      let studentName = element.full_name.toLowerCase();
      if (studentName.includes(searchValue)) {
        dashboard.innerHTML += `
                    <tr>
                      <td>${element.full_name}</td>
                      <td>${element.email}</td>
                      <td>${element.courses}</td>
                      <td>${element.age}</td>
                      <td>${element.gender}</td>
                      <td>${element.roll_num}</td>
                      <td>${element.cnic}</td>
                      <td>${element.contact}</td>
                      <td>
                        <select onchange="statusVa(this.value, ${element.id})">
                          <option disabled selected>${
                            element.status || "Select"
                          }</option>
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                      </td>
                    </tr>
                  `;
        matchFound = true;
      }
    });

    if (!matchFound) {
      dashboard.innerHTML = "<p>No student found.</p>";
    }
  });
}

// ========================== Check Student Data ==========================
const checkBtn = document.getElementById("student_btn");
const inputField = document.getElementById("stdInput");
const resultTable = document.getElementById("stdDataCheck");

if (checkBtn) {
  checkBtn.addEventListener("click", async () => {
    const cnic = inputField.value.trim();

    if (!cnic) {
      showError("Please enter a CNIC number");
      return;
    }

    resultTable.innerHTML = `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 20px;">
                    <div class="loading-spinner"></div> Loading student data...
                  </td>
                </tr>
              `;

    try {
      const { data, error } = await client
        .from("student_form")
        .select("*")
        .eq("cnic", cnic);

      if (error) throw error;

      if (!data || data.length === 0) {
        resultTable.innerHTML = `
                    <tr>
                      <td colspan="7" style="text-align: center; padding: 20px; color: #f44336;">
                        <i class="fas fa-exclamation-circle"></i> No student found with CNIC: ${cnic}
                      </td>
                    </tr>
                  `;
        return;
      }

      const student = data[0];
      resultTable.innerHTML = `
                  <tr>
                    <td>${student.full_name}</td>
                    <td>${student.email}</td>
                    <td>${student.courses}</td>
                    <td>${student.roll_num}</td>
                    <td>${student.cnic}</td>
                    <td class="status-${
                      student.status?.toLowerCase() || "pending"
                    }">
                      ${student.status || "Pending"}
                    </td>
                  </tr>
                `;
                
    } catch (error) {
      console.error("Error:", error.message);
      resultTable.innerHTML = `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: #f44336;">
                      <i class="fas fa-exclamation-circle"></i> ${
                        error.message || "Error fetching student data"
                      }
                    </td>
                  </tr>
                `;
    }
  });

  function showError(message) {
    resultTable.innerHTML = `
              <tr>
              <td colspan="7" style="text-align: center; padding: 20px; color: #f44336;">
              <i class="fas fa-exclamation-circle"></i> ${message}
              </td>
              </tr>
              `;
  }
}

 // Add Student button functionality
            document.getElementById('addStudentBtn').addEventListener('click', function () {
                Swal.fire({
                    title: 'Add New Student',
                    html: `
                        <input type="text" id="name" class="swal2-input" placeholder="Full Name">
                        <input type="email" id="email" class="swal2-input" placeholder="Email">
                        <input type="text" id="course" class="swal2-input" placeholder="Course">
                    `,
                    confirmButtonText: 'Add Student',
                    focusConfirm: false,
                    preConfirm: () => {
                        return {
                            name: document.getElementById('name').value,
                            email: document.getElementById('email').value,
                            course: document.getElementById('course').value
                        }
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire(
                            'Added!',
                            'Student has been added successfully.',
                            'success'
                        );
                    }
                });
            });
// // Theme Toggle
// const themeToggle = document.getElementById('theme-toggle');
// if(themeToggle){
// themeToggle.addEventListener('click', () => {
//   document.body.classList.toggle('light');

//   if (document.body.classList.contains('light')) {
//     themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
//     localStorage.setItem('theme', 'light');
//   } else {
//     themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
//     localStorage.setItem('theme', 'dark');
//   }
// });

// // Check for saved theme preference
// if (localStorage.getItem('theme') === 'light') {
//   document.body.classList.add('light');
//   themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
// }
// }
