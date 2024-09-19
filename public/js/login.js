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
    const response = await axios.post('http://localhost:4000/register', registerDetails);
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
    if (error.response && error.response.data.error) {
      const errorMessage = error.response.data.error;
      alert(`Registration failed: ${errorMessage}`);
    } else {
      alert("An error occurred. Please try again later.");
    }
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
    const response = await axios.post('http://localhost:4000/login', loginDetails);
    
    // Store the token in localStorage
    localStorage.setItem("authToken", response.data.token);

    alert('Login successful! Redirecting...');
    
    // Redirect to customer dashboard after successful login
    window.location.href = "/customer";
  } catch (error) {
    if (error.response && error.response.status === 401) {
      alert('Invalid email or password. Please try again.');
    } else if (error.response && error.response.data.error) {
      alert(`Login failed: ${error.response.data.error}`);
    } else {
      alert("An error occurred. Please try again later.");
    }
  }
});
