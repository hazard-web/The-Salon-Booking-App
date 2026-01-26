// DOM elements
const confirmationForm = document.getElementById('confirmationForm');
const bookingIdInput = document.getElementById('bookingId');
const confirmationMessage = document.getElementById('confirmationMessage');

const reminderForm = document.getElementById('reminderForm');
const reminderBookingIdInput = document.getElementById('reminderBookingId');
const reminderMessage = document.getElementById('reminderMessage');

// Function to get auth token from local storage
function getAuthToken() {
    const token = localStorage.getItem('authToken');
    console.log("Retrieved Token:", token);
    return token;
}

// Set authorization header for Axios requests
function setAuthHeader() {
    const token = getAuthToken();
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        alert("You are not authenticated. Please log in.");
        window.location.href = '/login'; // Redirect to login if token is missing
    }
}

// Function to send booking confirmation
async function sendBookingConfirmation(bookingId) {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('User is not authenticated');
        }

        const response = await axios.post('http://localhost:4000/notification/notify-booking', {
            bookingId: bookingId
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // Add the JWT token here
            }
        });

        confirmationMessage.innerText = response.data.message;
    } catch (err) {
        console.error('Error sending confirmation:', err);
        confirmationMessage.innerText = `Error sending confirmation: ${err.response ? err.response.data.error : err.message}`;
    }
}

// Function to send booking reminder
async function sendBookingReminder(bookingId) {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('User is not authenticated');
        }

        const response = await axios.post('http://localhost:4000/notification/send-reminder', {
            bookingId: bookingId
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // Add the JWT token here
            }
        });

        reminderMessage.innerText = response.data.message;
    } catch (err) {
        console.error('Error sending reminder:', err);
        reminderMessage.innerText = `Error sending reminder: ${err.response ? err.response.data.error : err.message}`;
    }
}

// Event listener for sending booking confirmation
confirmationForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const bookingId = bookingIdInput.value;
    sendBookingConfirmation(bookingId);
});

// Event listener for sending booking reminder
reminderForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const bookingId = reminderBookingIdInput.value;
    sendBookingReminder(bookingId);
});

// Initialize token in Axios on page load
document.addEventListener('DOMContentLoaded', () => {
    setAuthHeader();
});
