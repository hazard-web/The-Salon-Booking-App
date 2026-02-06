import { getAuthToken, setAuthHeader } from '../../utils/authHelpers';
import axios from 'axios';

// DOM elements
const confirmationForm = document.getElementById('confirmationForm') as HTMLFormElement | null;
const bookingIdInput = document.getElementById('bookingId') as HTMLInputElement | null;
const confirmationMessage = document.getElementById('confirmationMessage') as HTMLElement | null;

const reminderForm = document.getElementById('reminderForm') as HTMLFormElement | null;
const reminderBookingIdInput = document.getElementById('reminderBookingId') as HTMLInputElement | null;
const reminderMessage = document.getElementById('reminderMessage') as HTMLElement | null;

if (!confirmationForm || !bookingIdInput || !confirmationMessage || !reminderForm || !reminderBookingIdInput || !reminderMessage) {
    console.error('One or more DOM elements are missing.');
}

// Updated error handling to use a custom type guard
function isAxiosError(error: unknown): error is { response?: { data?: { error?: string } } } {
    return typeof error === 'object' && error !== null && 'response' in error;
}

// Function to send booking confirmation
async function sendBookingConfirmation(bookingId: string): Promise<void> {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('User is not authenticated');
        }

        const response = await axios.post<{ message: string }>('http://localhost:4000/notification/notify-booking', {
            bookingId: bookingId
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // Add the JWT token here
            }
        });

        if (confirmationMessage) {
            confirmationMessage.innerText = response.data.message;
        }
    } catch (err: unknown) {
        console.error('Error sending confirmation:', err);
        if (confirmationMessage) {
            confirmationMessage.innerText = `Error sending confirmation: ${isAxiosError(err) && err.response?.data?.error ? err.response.data.error : (err as Error).message}`;
        }
    }
}

// Function to send booking reminder
async function sendBookingReminder(bookingId: string): Promise<void> {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('User is not authenticated');
        }

        const response = await axios.post<{ message: string }>('http://localhost:4000/notification/send-reminder', {
            bookingId: bookingId
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // Add the JWT token here
            }
        });

        if (reminderMessage) {
            reminderMessage.innerText = response.data.message;
        }
    } catch (err: unknown) {
        console.error('Error sending reminder:', err);
        if (reminderMessage) {
            reminderMessage.innerText = `Error sending reminder: ${isAxiosError(err) && err.response?.data?.error ? err.response.data.error : (err as Error).message}`;
        }
    }
}

// Event listener for sending booking confirmation
if (confirmationForm && bookingIdInput) {
    confirmationForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const bookingId = bookingIdInput.value;
        sendBookingConfirmation(bookingId);
    });
}

// Event listener for sending booking reminder
if (reminderForm && reminderBookingIdInput) {
    reminderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const bookingId = reminderBookingIdInput.value;
        sendBookingReminder(bookingId);
    });
}

// Initialize token in Axios on page load
document.addEventListener('DOMContentLoaded', () => {
    setAuthHeader();
});
