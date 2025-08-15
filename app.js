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


const inputStd = document.getElementById('stdInput');
const checkStd = document.getElementById('student_btn');


// ========================== Student Form Submit ==========================
if (studentForm) {
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const courses = document.getElementById("courses").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const cnic = document.getElementById("cnic").value;
    const contact = document.getElementById("contact").value;

    if (
      !full_name ||
      !email ||
      !courses ||
      !age ||
      !gender ||
      !cnic ||
      !contact
    ) {
      Swal.fire("Error", "Please fill all fields", "warning");
      return;
    }

    const { error } = await client.from("student_form").insert({
      full_name,
      email,
      courses,
      age,
      gender,
      cnic,
      contact,
    });

    if (error) {
      console.log(error.message);
      Swal.fire("Error", "Failed to submit data", "error");
    } else {
      Swal.fire("Success", "Data successfully submitted!", "success");
    }

    full_name.value = ""
    email.value = ""
    courses.value = ""
    age.value = ""
    gender.value = ""
    cnic.value = ""
    contact.value = ""
  });
}

// ========================== Admin Login ==========================
if (adminLogin) {
  adminLogin.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!adminEmail.value || !adminPassword.value) {
      Swal.fire("Warning", "Please enter email and password", "warning");
      return;
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: adminEmail.value,
      password: adminPassword.value,
    });

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

// ========================== Load Student Dashboard ==========================
async function showDashboard() {
  if (!dashboard) return;

  const { data, error } = await client.from("student_form").select("*");
  if (error) {
    console.log(error.message);
    return;
  }

  data.forEach((element) => {
    dashboard.innerHTML += `
      <tr>
        <td>${element.full_name}</td>
        <td>${element.email}</td>
        <td>${element.courses}</td>
        <td>${element.age}</td>
        <td>${element.gender}</td>
        <td>${element.cnic}</td>
        <td>${element.contact}</td>
        <td>
          <select onchange="statusVa(this.value, ${element.id})">
            <option disabled selected>${element.status || "Select"}</option>
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

async function checkStudentData() {

  window.location.href = "checkstd.html"

}

document.addEventListener("DOMContentLoaded", function () {
  const checkStd = document.getElementById("student_btn");
  const inputStd = document.getElementById("stdInput");
  const showStatus = document.getElementById("showStatus");


  if (checkStd) {
    checkStd.addEventListener("click", async () => {
      // Show loading state
      showStatus.innerHTML = `
                <div class="status-header">
                    <svg class="status-icon" viewBox="0 0 24 24" fill="#4285f4">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                    <div class="status-title">Loading...</div>
                </div>
                <div class="status-content">Fetching student data, please wait.</div>
            `;
      showStatus.classList.add("show");

      try {
        const { data, error } = await client
          .from('student_form')
          .select("*")
          .eq('cnic', inputStd.value);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          showStatus.innerHTML = `
                        <div class="status-header">
                            <svg class="status-icon" viewBox="0 0 24 24" fill="#FF5722">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <div class="status-title">Student Not Found</div>
                        </div>
                        <div class="status-content">No student found with CNIC: ${inputStd.value}</div>
                    `;
          return;
        }

        const { full_name, email, courses, age, cnic, status } = data[0];

        showStatus.innerHTML = `
                    <div class="status-header">
                        <svg class="status-icon" viewBox="0 0 24 24" fill="#4CAF50">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <div class="status-title">Student Found</div>
                    </div>
                    <div class="status-content">
                        <div class="info-row">
                            <span class="info-label">Full Name:</span>
                            <span class="info-value">${full_name}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${email}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Courses:</span>
                            <span class="info-value">${courses}</span>
                        </div>
                       
                        <div class="info-row">
                            <span class="info-label">CNIC:</span>
                            <span class="info-value">${cnic}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value status-${status.toLowerCase()}">${status}</span>
                        </div>
                    </div>
                `;

      } catch (error) {
        console.error("Error:", error.message);
        showStatus.innerHTML = `
                    <div class="status-header">
                        <svg class="status-icon" viewBox="0 0 24 24" fill="#FF5722">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <div class="status-title">Error</div>
                    </div>
                    <div class="status-content">${error.message || 'An error occurred while fetching student data'}</div>
                `;
      }
    });
  }
});


