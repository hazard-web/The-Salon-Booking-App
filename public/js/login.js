// DOM elements
const signUp = document.getElementById("register-container");
const signIn = document.getElementById("login-container");
const container = document.querySelector(".container"); // Common parent container for toggle effect
const signUpBtn = document.querySelector("#register-form button[type='submit']");
const loginBtn = document.querySelector("#login-form button[type='submit']");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const regUsername = document.getElementById("register-username");
const regEmail = document.getElementById("register-email");
const regPassword = document.getElementById("register-password");
const regRole = document.getElementById("register-role"); // Ensure this is present in your HTML

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
    role: regRole.value
  };

  try {
    await axios.post('http://localhost:4000/register', registerDetails);
    alert('Registration successful! Please log in.');
    
    // Reset form fields after successful registration
    regUsername.value = '';
    regEmail.value = '';
    regPassword.value = '';
    regRole.value = '';
    
    // Switch to Sign In view
    container.classList.remove("right-panel-active");
    window.location.href = "/auth"; // Optional: If you want to redirect after registration
  } catch (error) {
    const errorMessage = error.response && error.response.data.error 
      ? error.response.data.error 
      : "An error occurred. Please try again later.";
    alert(`Registration failed: ${errorMessage}`);
  }
});

// Handle Login
lloginBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const loginDetails = {
    email: loginEmail.value,
    password: loginPassword.value
  };

  try {
    const response = await axios.post('http://localhost:4000/login', loginDetails);
    
    // Debug: log the entire response
    console.log("Login response:", response.data);
    
    const authToken = response.data.authToken;
    const userRole = response.data.role;

    if (!authToken) {
      alert("No token received! Authentication failed.");
      return;
    }

    // Debug: verify token and role before saving
    console.log("authToken:", authToken);
    console.log("userRole:", userRole);

    // Save the token and role in local storage
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("role", userRole);
    
    // Debug: check if token and role are stored properly
    console.log("Stored authToken:", localStorage.getItem("authToken"));
    console.log("Stored role:", localStorage.getItem("role"));

    let redirectUrl = "/customer"; // Default redirect
    if (userRole === "Owner") {
      redirectUrl = "/owner";
    } else if (userRole === "Admin") {
      redirectUrl = "/admin";
    }

    alert('Login successful! Redirecting...');
    window.location.href = redirectUrl;

  } catch (error) {
    const errorMessage = error.response && error.response.status === 401 
      ? 'Invalid email or password.' 
      : 'Login failed. Please try again later.';
    
    console.error("Login error:", error);
    alert(errorMessage);
  }
});
