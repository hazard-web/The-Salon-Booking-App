
// Event listener for sending booking confirmation
document.getElementById('confirmationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const bookingId = document.getElementById('bookingId').value;

    try {
        // Get the token from local storage
        const token = localStorage.getItem('authToken');

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

        document.getElementById('confirmationMessage').innerText = response.data.message;
    } catch (err) {
        console.error('Error sending confirmation:', err);
        document.getElementById('confirmationMessage').innerText = `Error sending confirmation: ${err.response ? err.response.data.error : err.message}`;
    }
});

// Event listener for sending booking reminder
document.getElementById('reminderForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const bookingId = document.getElementById('reminderBookingId').value;

    try {
        // Get the token from local storage
        const token = localStorage.getItem('authToken');

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

        document.getElementById('reminderMessage').innerText = response.data.message;
    } catch (err) {
        console.error('Error sending reminder:', err);
        document.getElementById('reminderMessage').innerText = `Error sending reminder: ${err.response ? err.response.data.error : err.message}`;
    }
});
