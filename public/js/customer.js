// DOM elements
const serviceSelect = document.getElementById("service-select");
const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");
const bookingsList = document.getElementById("bookings-list");

// API base URL
const baseURL = 'http://localhost:4000/customer';

// Get auth token from local storage
function getAuthToken() {
    const token = localStorage.getItem('authToken');
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
        alert("Error fetching services. Please try again later.");
        throw error;
    }
}

// Function to fetch and display available services
async function fetchServices() {
    serviceSelect.innerHTML = '<option>Loading services...</option>'; // Show loading state
    try {
        const services = await apiRequest('get', `${baseURL}/services`);
        serviceSelect.innerHTML = ''; // Clear the loading option
        if (services.length > 0) {
            services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.name;
                serviceSelect.appendChild(option);
            });
        } else {
            serviceSelect.innerHTML = '<option>No services available</option>';
        }
    } catch (error) {
        serviceSelect.innerHTML = '<option>Error loading services</option>';
        console.error('Failed to load services:', error);
    }
}

// Function to handle form submission for booking
async function handleBooking(event) {
    event.preventDefault();
    const serviceId = serviceSelect.value;
    const bookingDate = document.getElementById('booking-date').value;
    bookingMessage.textContent = '';

    // Validate form inputs
    if (!serviceId || !bookingDate) {
        bookingMessage.textContent = 'Please select a service and enter a booking date.';
        return;
    }

    try {
        const response = await apiRequest('post', `${baseURL}/book`, { serviceId, bookingDate });
        
        // Log the full response for debugging
        console.log('Booking Response:', response);

        // Check for the message instead of success
        if (response && response.message) { 
            bookingMessage.textContent = response.message; // Use the message from the response
            bookingForm.reset(); // Reset form
            fetchBookings(); // Refresh bookings after a successful booking
        } else {
            console.error('Unexpected response format:', response);
            bookingMessage.textContent = 'Booking failed. Please try again.'; // Handle failure
        }
    } catch (error) {
        console.error('Error during booking:', error);
        bookingMessage.textContent = 'Failed to book service. Please try again later.';
    }
}

// Function to fetch and display customer bookings
async function fetchBookings() {
    bookingsList.innerHTML = 'Loading your bookings...'; // Show loading state
    try {
        const response = await apiRequest('get', `${baseURL}/bookings`); // Ensure apiRequest is properly defined

        // Check if the response contains bookings
        if (response && Array.isArray(response.bookings)) {
            bookingsList.innerHTML = ''; // Clear previous bookings
            if (response.bookings.length === 0) {
                bookingsList.textContent = 'No bookings found.';
            } else {
                response.bookings.forEach(booking => {
                    const bookingItem = document.createElement('div');
                    // Make sure booking.service exists and has a name
                    bookingItem.textContent = `Service: ${booking.service ? booking.service.name : 'Hair Cut'}, Date: ${booking.bookingDate}`;
                    bookingsList.appendChild(bookingItem);
                });
            }
        } else {
            throw new Error('Unexpected response format'); // Handle unexpected response
        }
    } catch (error) {
        console.error('Error fetching bookings:', error); // Log the error for debugging
        bookingsList.innerHTML = 'Failed to load bookings. Please try again later.'; // Show error message
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setAuthHeader(); // Set auth headers initially
    fetchServices(); // Load available services
    fetchBookings(); // Load customer bookings
    bookingForm.addEventListener('submit', handleBooking); // Handle form submission
});
