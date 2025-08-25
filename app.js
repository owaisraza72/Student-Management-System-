const supabaseUrl = "https://enoclxtimybzrchssnjk.supabase.co";
const supabaseKey =
      '   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2NseHRpbXlienJjaHNzbmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjg1NTAsImV4cCI6MjA3MTYwNDU1MH0.HWiL-SvBpi31_tGVhBpYG0VBOLIBjkRZXB5nCT926Mw';

const client = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
let adminEmail = document.getElementById("adminEmail");
let adminPassword = document.getElementById("adminPassword");
let adminLogin = document.getElementById("adminLogin");
let studentForm = document.getElementById("studentForm");
let dashboard = document.getElementById("showData");
const logoutBtn = document.getElementById("logout");
const loader = document.getElementById('loader');


const inputStd = document.getElementById("stdInput");
const checkStd = document.getElementById("student_btn");
let inputValue = document.getElementById("searchInput");

// ========================== Student Form Submit ==========================
if (studentForm) {
  const full_name = document.getElementById("name");
  const email = document.getElementById("email");
  const courses = document.getElementById("courses");
  const campuses = document.getElementById("campus");
  const age = document.getElementById("age");
  const gender = document.getElementById("gender");
  const cnic = document.getElementById("cnic");
  const contact = document.getElementById("contact");

  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (
      !full_name.value ||
      !email.value ||
      !courses.value ||
      !campuses.value||
      !age.value ||
      !gender.value ||
      !cnic.value ||
      !contact.value
    ) {
      Swal.fire("Error", "Please fill all fields", "warning");
      return;
    }
    showLoader();

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
      campuses:campuses.value,
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

    if (!adminEmail.value || !adminPassword.value) {
      // hideLoader();
      Swal.fire("Warning", "Please enter email and password", "warning");
      return;
    }

    showLoader();

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
  loader.style.display = "block";
}
function hideLoader() {
  loader.style.display = "none";
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
if (currentPage === "dashboard.html"  || currentPage === "admin.html") {
  checkAuth();
}

async function stdTitileCard(status) {
  if (status) {
  
    const { count, error } = await client
      .from("student_form")
      .select("*", { count: "exact" })
      .eq("status", status);

    if (error) {
    
      Swal.fire("Error", error.message);
      return 0;
    }
    
    return count;
  }
  const { count, error } = await client
    .from("student_form")
    .select("*", { count: "exact" });

  if (error) {
    Swal.fire("Error", error.message);
    return 0;
  }
  return count;
  
}


// =========================  dashboardCardStd ===================================
async function dashboardCardStd() {


  let totalStd = await stdTitileCard();
  let pending = await stdTitileCard("Pending");
  let approved = await stdTitileCard("Approved");
  let rejected = await stdTitileCard("Rejected");


  let arrayStd = [
    {
      title: "Total Students",
      value: totalStd,
      iconClass: "fas fa-users",
      iconColor: "card-icon students",
    },
    {
      title: "Pending Request",
      value: pending,
      iconClass: "fas fa-clock",
      iconColor: "card-icon pending",
    },
    {
      title: "Approved",
      value: approved,
      iconClass: "fas fa-check",
      iconColor: "card-icon approved",
    },

    {
      title: "Rejected",
      value: rejected,
      iconClass: "fas fa-times-circle",
      iconColor: "card-icon rejected",
    },
  ];

  // ============ Load Student Dashboard ========
  if (!dashboard) return;

  let cardShow = document.querySelector(".card-container");
  cardShow.innerHTML = "";

  arrayStd.forEach((element) => {
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

  }

async function showDashboard() {

 let  dashboardCard = await dashboardCardStd();

  const { data, error } = await client.from("student_form").select("*");
  if (error) {
    console.log(error.message);
    return;
  }
    hideLoader();
  
  dashboard.innerHTML = ""; // clear old data
  data.forEach((element) => {
    dashboard.innerHTML += `
                  <tr>
        <td>${element.full_name}</td>
        <td>${element.email}</td>
        <td>${element.courses}</td>
        <td>${element.campuses}</td>
        <td>${element.gender}</td>
        <td>${element.roll_num}</td>

        <td>
            <select onchange="statusVa(this.value, ${element.id})">
                <option disabled selected>${element.status || "Select"}</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
            </select>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-edit" onclick="editStudent(${
                  element.id
                })" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="delStudent(${
                  element.id
                })" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
              `;
  });
  
}
showDashboard();

// ========================== Edit Student Function ==========================
async function editStudent(studentId) {
  // Get student data from DB
  
    showLoader();
  
  const { data, error } = await client
    .from("student_form")
    .select("*")
    .eq("id", studentId)
    .single();

    hideLoader();

  if (error) {
    Swal.fire("Error", "Unable to fetch student data.", "error");
    return;
  }

  // ========================== Delete Student Function ==========================
async function delStudent(studentId) {
    showLoader();
  
  const response = await client
    .from("student_form")
    .delete()
    .eq("id", studentId);

    hideLoader();
    

  Swal.fire("Student has been Deleted");

  dashboardCardStd();
}


  // ==================Show SweetAlert2 form with student details=====================
  const { value: formValues } = await Swal.fire({
    title: "✏️ Edit Student",
    html: `
    <style>
      .swal2-popup .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 10px;
        text-align: left;
      }
      .swal2-popup label {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
        display: block;
      }
      .swal2-popup input {
        width: 100%;
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid #ddd;
        font-size: 14px;
        outline: none;
        transition: 0.2s;
      }
      .swal2-popup input:focus {
        border-color: #3085d6;
        box-shadow: 0 0 4px rgba(48,133,214,0.4);
      }
    </style>

    <div class="form-grid">
      <div>
        <label>Full Name</label>
        <input id="swal-full_name" value="${data.full_name}">
      </div>
      <div>
        <label>Email</label>
        <input id="swal-email" type="email" value="${data.email}">
      </div>
      <div>
        <label>Courses</label>
        <input id="swal-courses" value="${data.courses}">
      </div>
      <div>
        <label>Campuses</label>
        <input id="swal-campuses" value="${data.campuses}">
      </div>
      <div>
        <label>Age</label>
        <input id="swal-age" type="number" value="${data.age}">
      </div>
      <div>
        <label>Gender</label>
        <input id="swal-gender" value="${data.gender}">
      </div>
      <div>
        <label>Roll No</label>
        <input id="swal-roll_num" value="${data.roll_num}">
      </div>
      <div>
        <label>CNIC</label>
        <input id="swal-cnic" value="${data.cnic}">
      </div>
      <div>
        <label>Contact</label>
        <input id="swal-contact" value="${data.contact}">
      </div>
    </div>
  `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "💾 Update",
    preConfirm: () => {
      return {
        full_name: document.getElementById("swal-full_name").value,
        email: document.getElementById("swal-email").value,
        courses: document.getElementById("swal-courses").value,
        campuses: document.getElementById("swal-campuses").value,
        age: document.getElementById("swal-age").value,
        gender: document.getElementById("swal-gender").value,
        roll_num: document.getElementById("swal-roll_num").value,
        cnic: document.getElementById("swal-cnic").value,
        contact: document.getElementById("swal-contact").value,
      };
    },
  });

  if (formValues) {
    // Update student in DB
    const { error: updateError } = await client
      .from("student_form")
      .update(formValues)
      .eq("id", studentId);

    if (updateError) {
      Swal.fire("Error", "Failed to update student.", "error");
      return;
    }

    Swal.fire("Updated!", "Student details updated successfully.", "success");
    showDashboard(); // Refresh dashboard
  }
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
            showDashboard();
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
    <td>${element.campuses}</td>
    <td>${element.gender}</td>
    <td>${element.roll_num}</td>
    <td>
    <select onchange="statusVa(this.value, ${element.id})">
    <option disabled selected>${element.status || "Select"}</option>
    <option>Pending</option>
    <option>Approved</option>
    <option>Rejected</option>
    </select>
    </td>
    <td>
            <div class="action-buttons">
                <button class="btn-edit" onclick="editStudent(${
                  element.id
                })" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteStudent(${
                  element.id
                })" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
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
                      <td>${element.campuses}</td>
                      <td>${element.gender}</td>
                      <td>${element.roll_num}</td>
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
                      <td>
            <div class="action-buttons">
                <button class="btn-edit" onclick="editStudent(${
                  element.id
                })" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteStudent(${
                  element.id
                })" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
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

// ============================================= Check Student Data ============================================
function checkStudentData() {
  window.location.href = "checkstd.html";
}
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
                    <td>${student.campuses}</td>
                    <td>${student.roll_num}</td>
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
 let addStudentBtn = document.getElementById("addStudentBtn")
 if(addStudentBtn){
 addStudentBtn.addEventListener("click", function () {
  Swal.fire({
    title: "Add New Student",
    html: `
                        <input type="text" id="name" class="swal2-input" placeholder="Full Name">
                        <input type="email" id="email" class="swal2-input" placeholder="Email">
                        <input type="text" id="course" class="swal2-input" placeholder="Course">
                    `,
    confirmButtonText: "Add Student",
    focusConfirm: false,
    preConfirm: () => {
      return {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        course: document.getElementById("course").value,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Added!", "Student has been added successfully.", "success");
    }
  });
});
}








// // ==================== Campuses Admin ===============================


// async function stdTitileCard(status) {
//   if (status) {
  
//     const { count, error } = await client
//       .from("student_form")
//       .select("*", { count: "exact" })
//       .eq("status", status);

//     if (error) {
    
//       Swal.fire("Error", error.message);
//       return 0;
//     }
    
//     return count;
//   }
//   const { count, error } = await client
//     .from("student_form")
//     .select("*", { count: "exact" });

//   if (error) {
//     Swal.fire("Error", error.message);
//     return 0;
//   }
//   return count;
  
// }








// // =========================  dashboardCardStd ===================================
// async function dashboardCardStd() {


//   let totalStd = await stdTitileCard();
//   let pending = await stdTitileCard("Pending");
//   let approved = await stdTitileCard("Approved");
//   let rejected = await stdTitileCard("Rejected");


//   let arrayStd = [
//     {
//       title: "Total Students",
//       value: totalStd,
//       iconClass: "fas fa-users",
//       iconColor: "card-icon students",
//     },
//     {
//       title: "Pending Request",
//       value: pending,
//       iconClass: "fas fa-clock",
//       iconColor: "card-icon pending",
//     },
//     {
//       title: "Approved",
//       value: approved,
//       iconClass: "fas fa-check",
//       iconColor: "card-icon approved",
//     },

//     {
//       title: "Rejected",
//       value: rejected,
//       iconClass: "fas fa-times-circle",
//       iconColor: "card-icon rejected",
//     },
//   ];

//   // ============ Load Student Dashboard ========
//   if (!dashboard) return;

//   let cardShow = document.querySelector(".card-container");
//   cardShow.innerHTML = "";

//   arrayStd.forEach((element) => {
//     cardShow.innerHTML += `<div class="card">
//                 <div class="card-header">
//                     <div>
//                         <div class="card-title">${element.title}</div>
//                         <div class="card-value">${element.value}</div>
//                     </div>
//                     <div class="${element.iconColor}">
//                         <i class="${element.iconClass}"></i>
//                     </div>
//                 </div>
//             </div> `;
//   });

//   }

// async function showDashboard() {

//  let  dashboardCard = await dashboardCardStd();
//    const {
//     data: { session },
//   } = await client.auth.getSession();

//   let adminCampus = session.user.email
// console.log(adminCampus)

//   const { data, error } = await client.from("student_form").select("*").eq('campuses')
//   if (error) {
//     console.log(error.message);
//     return;
//   }
//     hideLoader();
  
//   dashboard.innerHTML = ""; // clear old data
//   data.forEach((element) => {
//     dashboard.innerHTML += `
//                   <tr>
//         <td>${element.full_name}</td>
//         <td>${element.email}</td>
//         <td>${element.courses}</td>
//         <td>${element.campuses}</td>
//         <td>${element.gender}</td>
//         <td>${element.roll_num}</td>

//         <td>
//             <select onchange="statusVa(this.value, ${element.id})">
//                 <option disabled selected>${element.status || "Select"}</option>
//                 <option>Pending</option>
//                 <option>Approved</option>
//                 <option>Rejected</option>
//             </select>
//         </td>
//         <td>
//             <div class="action-buttons">
//                 <button class="btn-edit" onclick="editStudent(${
//                   element.id
//                 })" title="Edit">
//                     <i class="fas fa-edit"></i>
//                 </button>
//                 <button class="btn-delete" onclick="delStudent(${
//                   element.id
//                 })" title="Delete">
//                     <i class="fas fa-trash"></i>
//                 </button>
//             </div>
//         </td>
//     </tr>
//               `;
//   });
  
// }
// showDashboard();



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
