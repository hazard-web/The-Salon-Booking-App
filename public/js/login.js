const signUp = document.getElementById("register-container");
const signIn = document.getElementById("login-container");
const container = document.querySelector(".container"); // Use a common parent container if applicable
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
    alert('Registration successful');
    container.classList.remove("right-panel-active"); // Switch to Sign In view
    window.location.href = "/auth";
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.error;
      alert(errorMessage);
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
    alert('Login successful');
    localStorage.setItem("token", response.data.token);
    window.location.href = "/";
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.error;
      alert(errorMessage);
    } else {
      alert("An error occurred. Please try again later.");
    }
  }
});
