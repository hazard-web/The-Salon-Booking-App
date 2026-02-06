import axios from 'axios';

// DOM elements
const signUp = document.getElementById('signUp');
const container = document.getElementById('container');
const signIn = document.getElementById('signIn');
const signUpBtn = document.getElementById('signUpBtn');
const regUsername = document.getElementById('regUsername') as HTMLInputElement;
const regEmail = document.getElementById('regEmail') as HTMLInputElement;
const regPassword = document.getElementById('regPassword') as HTMLInputElement;
const regRole = document.getElementById('regRole') as HTMLInputElement;
const regMobile = document.getElementById('regMobile') as HTMLInputElement;
const loginBtn = document.getElementById('loginBtn');
const loginEmail = document.getElementById('loginEmail') as HTMLInputElement;
const loginPassword = document.getElementById('loginPassword') as HTMLInputElement;

if (!signUp || !container || !signIn || !signUpBtn || !regUsername || !regEmail || !regPassword || !regRole || !regMobile || !loginBtn || !loginEmail || !loginPassword) {
  console.error('One or more required DOM elements are missing.');
} else {
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
    } catch (error: unknown) {
      // Ensure `errorMessage` is scoped correctly
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error:', errorMessage);
      }
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
      const userId = (response.data as { userId: string }).userId;
      const userRole = (response.data as { role: string }).role;  // ✅ Check if role is in response

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

    } catch (error: unknown) {
      // Ensure `errorMessage` is scoped correctly
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error:', errorMessage);
      }
      alert(errorMessage);
    }
  });
}
