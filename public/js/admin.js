// DOM elements
const usersList = document.getElementById("users-list");
const salonsList = document.getElementById("salons-list");
const bookingsList = document.getElementById("bookings-list");

// API base URL for admin routes
const adminBaseURL = 'http://localhost:4000/admin';

// Get auth token from local storage
function getAuthToken() {
    const token = localStorage.getItem('authToken'); // Assuming admin's token is stored as 'authToken'
    console.log("Retrieved Token:", token);
    return token;
}

// Set authorization headers in Axios
function setAuthHeader() {
    const token = getAuthToken();
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        alert("You are not authenticated. Please log in.");
        window.location.href = '/login'; // Redirect to login if no token
    }
}

// Generic function to handle API requests
async function apiRequest(method, url, data = null) {
    setAuthHeader(); // Ensure headers are set
    try {
        const response = await axios({ method, url, data });
        console.log(`${method.toUpperCase()} request to ${url} succeeded:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error during ${method.toUpperCase()} request to ${url}:`, error.response ? error.response.data : error.message);
        alert("Error occurred. Please try again later.");
        throw error;
    }
}

// Function to fetch and display all users
async function fetchUsers() {
    usersList.innerHTML = 'Loading users...'; // Show loading state
    try {
        const users = await apiRequest('get', `${adminBaseURL}/users`);
        usersList.innerHTML = ''; // Clear loading state
        if (users.length > 0) {
            users.forEach(user => {
                const userItem = document.createElement('li');
                userItem.innerHTML = `
                    ${user.username} (${user.email})
                    <button class="access-btn" data-id="${user.id}">Access</button>
                `;
                usersList.appendChild(userItem);

                // Adding event listener for access button
                userItem.querySelector('.access-btn').addEventListener('click', (e) => {
                    const userId = e.target.getAttribute('data-id');
                    console.log(`Accessing user with ID: ${userId}`); // Debugging line
                    accessUser(userId);
                });
            });
        } else {
            usersList.innerHTML = 'No users found.';
        }
    } catch (error) {
        usersList.innerHTML = 'Failed to load users. Please try again later.';
        console.error('Failed to load users:', error);
    }
}

// Function to fetch and display all salons
async function fetchSalons() {
    salonsList.innerHTML = 'Loading salons...'; // Show loading state
    try {
        const salons = await apiRequest('get', `${adminBaseURL}/salons`);
        salonsList.innerHTML = ''; // Clear loading state
        if (salons.length > 0) {
            salons.forEach(salon => {
                const salonItem = document.createElement('li');
                salonItem.innerHTML = `
                    <strong>${salon.name}</strong> - Owned by: ${salon.User.username} (${salon.User.email})
                    <button class="approve-btn" data-id="${salon.id}" data-approved="true">Approve</button>
                    <button class="disapprove-btn" data-id="${salon.id}" data-approved="false">Disapprove</button>
                `;
                salonsList.appendChild(salonItem);
            });

            // Add event listeners for approve/disapprove buttons
            document.querySelectorAll('.approve-btn, .disapprove-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const salonId = e.target.getAttribute('data-id');
                    const approved = e.target.getAttribute('data-approved') === 'true';
                    console.log(`Salon ID: ${salonId}, Approved: ${approved}`); // Debugging line
                    approveSalon(salonId, approved);
                });
            });
        } else {
            salonsList.innerHTML = 'No salons found.';
        }
    } catch (error) {
        salonsList.innerHTML = 'Failed to load salons. Please try again later.';
        console.error('Failed to load salons:', error);
    }
}

// Function to approve/disapprove a salon
async function approveSalon(salonId, approved) {
    try {
        const response = await apiRequest('post', `${adminBaseURL}/approve-salon`, { salonId, approved });
        console.log(`Salon ${approved ? 'approved' : 'disapproved'} successfully:`, response);
        fetchSalons(); // Refresh salons list after approving/disapproving
    } catch (error) {
        console.error(`Failed to ${approved ? 'approve' : 'disapprove'} salon:`, error);
    }
}

// Function to fetch and display all bookings
async function fetchBookings() {
    bookingsList.innerHTML = 'Loading bookings...'; // Show loading state
    try {
        const bookings = await apiRequest('get', `${adminBaseURL}/bookings`);
        bookingsList.innerHTML = ''; // Clear loading state
        
        // Ensure bookings is an array before proceeding
        if (Array.isArray(bookings) && bookings.length > 0) {
            bookings.forEach(booking => {
                const bookingItem = document.createElement('li');
                bookingItem.textContent = `
                    Service: ${booking.Service.name}, 
                    Customer: ${booking.customer.username}, // Changed to 'customer' based on alias
                    Date: ${new Date(booking.bookingDate).toLocaleDateString()}
                `;
                bookingsList.appendChild(bookingItem);
            });
        } else {
            bookingsList.innerHTML = 'No bookings found.';
        }
    } catch (error) {
        bookingsList.innerHTML = 'Failed to load bookings. Please try again later.';
        console.error('Failed to load bookings:', error);
    }
}


// Function to access a user
async function accessUser(userId) {
    try {
        // Logic to access user details (you can define this function according to your requirements)
        console.log(`Accessing user with ID: ${userId}`); // Debugging line
        // For example, you can redirect to a user details page or open a modal
        window.location.href = `/user-details.html?id=${userId}`; // Example redirection
    } catch (error) {
        console.error(`Failed to access user with ID ${userId}:`, error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setAuthHeader(); // Set auth headers initially
    fetchUsers(); // Load all users
    fetchSalons(); // Load all salons
    fetchBookings(); // Load all bookings
});
