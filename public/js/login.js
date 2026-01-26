// DOM elements
const signUp = document.getElementById("register-container");
const signIn = document.getElementById("login-container");
const container = document.querySelector(".container");
const signUpBtn = document.querySelector("#register-form button[type='submit']");
const loginBtn = document.querySelector("#login-form button[type='submit']");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const regUsername = document.getElementById("register-username");
const regEmail = document.getElementById("register-email");
const regPassword = document.getElementById("register-password");
const regRole = document.getElementById("register-role");
const regMobile = document.getElementById("register-mobile");

// Toggle between Sign Up and Sign In views
signUp.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signIn.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

// Handle Registration
signUpBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const registerDetails = {
    username: regUsername.value,
    email: regEmail.value,
    password: regPassword.value,
    role: regRole.value,
    mobilenumber: regMobile.value  // ✅ FIXED: changed from mobileNumber
  };

  try {
    // ✅ FIXED: added /auth prefix
    const response = await axios.post('http://localhost:4000/auth/register', registerDetails);
    console.log('✅ Registration successful:', response.data);
    
    alert('Registration successful! Please log in.');

    // Reset form fields
    regUsername.value = '';
    regEmail.value = '';
    regPassword.value = '';
    regRole.value = '';
    regMobile.value = '';
    
    // Switch to Sign In view
    container.classList.remove("right-panel-active");
  } catch (error) {
    const errorMessage = error.response?.data?.error 
      ? error.response.data.error 
      : "An error occurred. Please try again later.";
    console.error("Registration error:", error);
    alert(`Registration failed: ${errorMessage}`);
  }
});

// Handle Login
loginBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const loginDetails = {
    email: loginEmail.value,
    password: loginPassword.value
  };

  try {
    const response = await axios.post('http://localhost:4000/auth/login', loginDetails);
    
    console.log("✅ Login response:", response.data);
    
    // ✅ FIXED: Backend returns userId and role, not authToken
    const userId = response.data.userId;
    const userRole = response.data.role;  // ✅ Check if role is in response

    if (!userId) {
      alert("No userId received! Authentication failed.");
      return;
    }

    // Save to localStorage
    localStorage.setItem("userId", userId);
    if (userRole) {
      localStorage.setItem("role", userRole);
    }
    
    console.log("✅ Stored userId:", localStorage.getItem("userId"));
    console.log("✅ Stored role:", localStorage.getItem("role"));

    // Redirect based on role
    let redirectUrl = "/customer";  // Default
    if (userRole === "Owner") {
      redirectUrl = "/owner";
    } else if (userRole === "Admin") {
      redirectUrl = "/admin";
    }

    alert('✅ Login successful! Redirecting...');
    window.location.href = redirectUrl;

  } catch (error) {
    const errorMessage = error.response?.status === 401 
      ? 'Invalid email or password.' 
      : 'Login failed. Please try again later.';
    
    console.error("❌ Login error:", error);
    alert(errorMessage);
  }
});
