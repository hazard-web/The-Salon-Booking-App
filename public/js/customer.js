// DOM elements
const servicesList = document.getElementById("services-list");
const serviceSelect = document.getElementById("service-select");
const bookingsList = document.getElementById("bookings-list");
const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");

// Define API base URL
const baseURL = 'http://localhost:4000/customer';

// Function to get the auth token from local storage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Function to fetch and display available services
async function fetchServices() {
    const token = getAuthToken();
    if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
    }

    try {
        const response = await axios.get(`${baseURL}/services`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const services = response.data;

        // Clear previous options in case of re-render
        serviceSelect.innerHTML = '';

        // Populate the dropdown with services
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        if (error.response && error.response.status === 401) {
            alert("Unauthorized access. Please log in again.");
        }
    }
}

// Function to handle booking form submission
async function handleBooking(event) {
    event.preventDefault();

    const serviceId = serviceSelect.value;
    const bookingDate = document.getElementById('booking-date').value;
    bookingMessage.textContent = '';  // Clear previous messages

    const token = getAuthToken();
    if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
    }

    try {
        const response = await axios.post(`${baseURL}/book`, {
            serviceId,
            bookingDate
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        bookingMessage.textContent = 'Service booked successfully!';
        fetchBookings(); // Refresh bookings list
    } catch (error) {
        console.error('Error booking service:', error);
        bookingMessage.textContent = 'Failed to book service. Please try again later.';
        if (error.response && error.response.status === 401) {
            alert("Unauthorized access. Please log in again.");
        }
    }
}

// Function to fetch and display customer bookings
async function fetchBookings() {
    const token = getAuthToken();
    if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
    }

    try {
        const response = await axios.get(`${baseURL}/bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const bookings = response.data;

        // Clear existing bookings
        bookingsList.innerHTML = '';

        // Populate the list with bookings
        bookings.forEach(booking => {
            const bookingItem = document.createElement('div');
            bookingItem.textContent = `Service: ${booking.serviceName}, Date: ${booking.bookingDate}`;
            bookingsList.appendChild(bookingItem);
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        if (error.response && error.response.status === 401) {
            alert("Unauthorized access. Please log in again.");
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchServices();
    fetchBookings();

    bookingForm.addEventListener('submit', handleBooking);
});
