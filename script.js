const API = "http://localhost:5000/api";

// ─── REGISTER ───
async function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = "employee"; // Default role

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    let data;
    try {
        data = await res.json();
    } catch (e) {
        console.error("Could not parse JSON response:", await res.text());
        alert(`Server Error: Invalid response from server. Status: ${res.status}`);
        return;
    }

    console.log("Registration response from server:", { status: res.status, ok: res.ok, data });

    if (!res.ok) {
      // Handle errors from the server (e.g., validation)
      const errorMessage = data.errors ? data.errors.map(e => e.msg).join(', ') : (data.message || "No specific error message provided by the server.");
      alert(`Registration failed (Code: ${res.status}): ${errorMessage}`);
      return;
    }

    // On successful registration
    alert(data.message || "Registration successful, but no confirmation message was returned.");
    
    if (data.token && data.userId) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        window.location.href = "complete_profile.html"; // Redirect to profile completion
    } else {
        alert("Registration seemed successful, but login credentials were not provided. Cannot proceed.");
    }

  } catch (error) {
    console.error("An error occurred during the fetch operation:", error);
    alert("An unexpected network error occurred. Please check your connection and try again.");
  }
}

// ─── LOGIN ───
async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Login failed: ${data.message}`);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id); // Store userId for consistency
    alert("Login Successful!");

    if (data.user.profileCompleted) {
      window.location.href = "dashboard.html";
    } else {
      alert("Please complete your profile before proceeding.");
      window.location.href = "complete_profile.html";
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An unexpected error occurred during login.");
  }
}

// ─── COMPLETE PROFILE ───
async function updateProfile(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Authentication error. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  const profileData = {
    phone: document.getElementById("phone").value,
    employeeId: document.getElementById("employeeId").value,
    department: document.getElementById("department").value,
    designation: document.getElementById("designation").value,
    gender: document.getElementById("gender").value,
    dob: document.getElementById("dob").value,
    joiningDate: document.getElementById("joiningDate").value,
    address: document.getElementById("address").value,
    emergencyContact: document.getElementById("emergencyContact").value,
  };

  try {
    const res = await fetch(`${API}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      // Per user story, redirect to login after completing profile
      localStorage.removeItem("token"); // Clear token as user needs to log in
      localStorage.removeItem("userId");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Profile update error:", error);
    alert("An unexpected error occurred while updating your profile.");
  }
}


// ─── APPLY LEAVE ───
async function applyLeave(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");

  const body = {
    fullname: document.getElementById("fullname").value,
    department: document.getElementById("department").value,
    leaveType: document.getElementById("leaveType").value,
    fromDate: document.getElementById("fromDate").value,
    toDate: document.getElementById("toDate").value,
    reason: document.getElementById("reason").value,
  };

  const res = await fetch(`${API}/leave/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  alert(data.message);
  if (res.ok) window.location.href = "dashboard.html";
}

// ─── DASHBOARD & LEAVE HISTORY (Generic Loader) ───
async function loadUserLeaves(targetTableId) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${API}/leave/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            if (res.status === 401) logout();
            return;
        }

        const leaves = await res.json();
        const table = document.getElementById(targetTableId);
        if (!table) return;

        // Populate dashboard stats if on dashboard
        if (targetTableId === "dashboardTable") {
            document.getElementById("totalRequests").innerText = leaves.length;
            document.getElementById("approvedRequests").innerText = leaves.filter(l => l.status === "Approved").length;
            document.getElementById("rejectedRequests").innerText = leaves.filter(l => l.status === "Rejected").length;
            document.getElementById("pendingRequests").innerText = leaves.filter(l => l.status === "Pending").length;
        }
        
        // Populate table
        table.innerHTML = leaves.length === 0 ?
            `<tr><td colspan="4" class="no-data">No Leave Records Found</td></tr>` :
            leaves.slice().reverse().map(l => `
                <tr>
                    <td>${l.leaveType}</td>
                    <td>${new Date(l.fromDate).toLocaleDateString()}</td>
                    <td>${new Date(l.toDate).toLocaleDateString()}</td>
                    <td class="${l.status.toLowerCase()}">${l.status}</td>
                </tr>`
            ).join("");

    } catch (error) {
        console.error("Error loading leaves:", error);
    }
}


// ─── ADMIN: LOAD ALL LEAVES ───
async function loadAdminLeaves() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  
  const res = await fetch(`${API}/leave/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
      if (res.status === 401) {
          logout(); // Log out for invalid token
      } 
      // For other errors, just return and let the page remain blank or show previous data
      return;
  }

  const leaves = await res.json();
  const table = document.getElementById("adminTable");
  if (!table) return;

  document.getElementById("totalRequests").innerText = leaves.length;
  document.getElementById("approvedCount").innerText = leaves.filter(
    (l) => l.status === "Approved"
  ).length;
  document.getElementById("pendingCount").innerText = leaves.filter(
    (l) => l.status === "Pending"
  ).length;

  table.innerHTML =
    leaves.map((l) => `
    <tr>
      <td>${l.userId ? l.userId.name : 'N/A'}</td>
      <td>${l.leaveType}</td>
      <td>${new Date(l.fromDate).toLocaleDateString()}</td>
      <td>${new Date(l.toDate).toLocaleDateString()}</td>
      <td class="${l.status.toLowerCase()}">${l.status}</td>
      <td>
        <button class="approve-btn" onclick="updateLeaveStatus('${l._id}', 'Approved')" ${
      l.status !== "Pending" ? "disabled" : ""
    }>Approve</button>
        <button class="reject-btn"  onclick="updateLeaveStatus('${l._id}', 'Rejected')"  ${
      l.status !== "Pending" ? "disabled" : ""
    }>Reject</button>
      </td>
    </tr>`
    ).join("");
}

// ─── ADMIN: UPDATE LEAVE STATUS ───
async function updateLeaveStatus(id, status) {
  const token = localStorage.getItem("token");
  let url;

  if (status === 'Approved') {
    url = `${API}/leave/approve/${id}`;
  } else if (status === 'Rejected') {
    url = `${API}/leave/reject/${id}`;
  } else {
    // Optional: handle other statuses or errors
    console.error("Invalid status for update:", status);
    return;
  }

  await fetch(url, {
    method: "PUT",
    headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    },
    // The backend route does not need a body, it's encoded in the URL.
    // body: JSON.stringify({ status }) 
  });
  loadAdminLeaves(); // Refresh the list
}


// ─── LOGOUT ───
function logout() {
  localStorage.clear();
  alert("Logged Out Successfully");
  window.location.href = "login.html";
}


// ─── AUTO LOAD on page ───
window.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("leave_history.html")) {
    loadUserLeaves("leaveTable");
    // Add search functionality for leave history
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("keyup", function() {
        const filter = this.value.toLowerCase();
        const tableBody = document.getElementById("leaveTable");
        if (tableBody) {
          const rows = tableBody.querySelectorAll("tr");
          rows.forEach(function(row) {
            const firstCell = row.querySelector("td"); // Assuming leave type is the first column
            if (!firstCell) return; // Skip if no cells (e.g., "No Leave Records Found" row)
            const text = firstCell.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? "" : "none";
          });
        }
      });
    }
  }
  if (path.endsWith("admin_panel.html")) {
    const adminContent = document.getElementById('admin-main-content');
    if (adminContent) {
        // NOTE: This is a simple, insecure client-side passcode check.
        // For a real application, this should be handled by a robust backend authentication and authorization system.
        const passcode = prompt("Please enter the admin passcode to continue:");
        const correctPasscode = "admin123"; // This should not be hardcoded in a real app.

        if (passcode === correctPasscode) {
            adminContent.style.display = 'block';
            loadAdminLeaves();
        } else {
            alert("Incorrect passcode. You will be redirected.");
            window.location.href = "index.html";
        }
    }
  }
  if (path.endsWith("dashboard.html")) loadUserLeaves("dashboardTable");
  
  // Pre-fill profile page with user data
  if (path.endsWith("profile.html") || path.endsWith("complete_profile.html")) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      return;
    }
    fetch(`${API}/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
          if(!res.ok) throw new Error('Could not fetch profile');
          return res.json()
      })
      .then(user => {
        if (user) {
          // Use a function to avoid repetition
          const setValue = (id, value) => {
              const el = document.getElementById(id);
              if (el) el.value = value || '';
          };
          setValue('name', user.name);
          setValue('email', user.email);
          setValue('phone', user.phone);
          setValue('employeeId', user.employeeId);
          setValue('department', user.department);
          setValue('designation', user.designation);
          setValue('gender', user.gender);
          // Formatting dates for input[type=date]
          if(user.dob) setValue('dob', new Date(user.dob).toISOString().split('T')[0]);
          if(user.joiningDate) setValue('joiningDate', new Date(user.joiningDate).toISOString().split('T')[0]);
          setValue('address', user.address);
          setValue('emergencyContact', user.emergencyContact);
        }
      })
      .catch(err => {
          console.error("Failed to pre-fill profile:", err);
          logout(); // If we can't get profile, something is wrong, so log out
      });
  }
});