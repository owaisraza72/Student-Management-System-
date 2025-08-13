const supabaseUrl = "https://blkxlczwjkjgdfixbide.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsa3hsY3p3amtqZ2RmaXhiaWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzA3NDcsImV4cCI6MjA2ODQwNjc0N30.z6vZxMuPTvTn7ShSexmSo9C5gGJpl4AvJCSBknIDOZc";

const client = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
let adminEmail = document.getElementById("adminEmail");
let adminPassword = document.getElementById("adminPassword");
let adminLogin = document.getElementById("adminLogin");
let submit = document.getElementById("submit");
let dashboard = document.getElementById("showData");

// ========================== Student Form Submit ==========================
if (submit) {
  submit.addEventListener("click", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const courses = document.getElementById("courses").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const roll_num = document.getElementById("roll_num").value;
    const contact = document.getElementById("contact").value;

    if (
      !full_name ||
      !email ||
      !courses ||
      !age ||
      !gender ||
      !roll_num ||
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
      roll_num,
      contact,
    });

    if (error) {
      console.log(error.message);
      Swal.fire("Error", "Failed to submit data", "error");
    } else {
      Swal.fire("Success", "Data successfully submitted!", "success");
    }
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
        <td>${element.roll_num}</td>
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
