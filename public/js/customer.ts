// DOM elements
const serviceSelect = document.getElementById("service-select") as HTMLSelectElement | null;
const bookingForm = document.querySelector<HTMLFormElement>('#bookingForm');
bookingForm!.addEventListener('submit', handleBooking); // Handle form submission
const bookingMessage = document.getElementById("booking-message") as HTMLElement | null;
const bookingsList = document.getElementById("bookings-list") as HTMLElement | null;
const makePaymentButton = document.getElementById("make-payment-button") as HTMLButtonElement | null; // Reference to the Make Payment button

// API base URL
const baseURL = 'http://localhost:4000/customer';

// Removed duplicate functions `getAuthToken` and `setAuthHeader` as they are now imported from `authHelpers.ts`.
import { getAuthToken, setAuthHeader } from '../../utils/authHelpers';

// Generic function to handle API requests
async function apiRequest(method: string, url: string, data: object | null = null): Promise<any> {
    setAuthHeader(); // Ensure headers are set
    try {
        const response = await axios({ method, url, data });
        console.log(`${method.toUpperCase()} request to ${url} succeeded:`, response.data);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error during ${method.toUpperCase()} request to ${url}:`, error.message);
        } else {
            console.error(`Error during ${method.toUpperCase()} request to ${url}:`, error);
        }
        alert("Error fetching services. Please try again later.");
        throw error;
    }
}

// Function to fetch and display available services
async function fetchServices(): Promise<void> {
    if (!serviceSelect) {
        console.error("serviceSelect element not found.");
        return;
    }
    serviceSelect.innerHTML = '<option>Loading services...</option>'; // Show loading state
    try {
        const services: Array<{ id: string; name: string }> = await apiRequest('get', `${baseURL}/services`);
        serviceSelect.innerHTML = ''; // Clear the loading option
        if (services.length > 0) {
            services.forEach((service) => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.name;
                serviceSelect.appendChild(option);
            });
        } else {
            serviceSelect.innerHTML = '<option>No services available</option>';
        }
    } catch (error: unknown) {
        serviceSelect.innerHTML = '<option>Error loading services</option>';
        console.error('Failed to load services:', error);
    }
}

// Function to handle form submission for booking
async function handleBooking(event: Event): Promise<void> {
    event.preventDefault();
    if (!serviceSelect || !bookingForm || !bookingMessage) {
        console.error("Required DOM elements not found.");
        return;
    }

    const serviceId = (serviceSelect as HTMLSelectElement).value;
    const bookingDateInput = document.getElementById('booking-date') as HTMLInputElement | null;
    const bookingDate = bookingDateInput?.value || '';
    bookingMessage.textContent = '';

    // Validate form inputs
    if (!serviceId || !bookingDate) {
        bookingMessage.textContent = 'Please select a service and enter a booking date.';
        return;
    }

    try {
        const response: { message: string } = await apiRequest('post', `${baseURL}/book`, { serviceId, bookingDate });

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
    } catch (error: unknown) {
        console.error('Error during booking:', error);
        bookingMessage.textContent = 'Failed to book service. Please try again later.';
    }
}

// Function to fetch and display bookings
async function fetchBookings(): Promise<void> {
    if (!bookingsList) {
        console.error("bookingsList element not found.");
        return;
    }
    bookingsList.innerHTML = 'Loading your bookings...'; // Show loading state
    try {
        const response: { bookings: Array<{ id: string; serviceName: string; bookingDate: string }> } = await apiRequest('get', `${baseURL}/bookings`);
        bookingsList.innerHTML = ''; // Clear previous bookings

        if (response.bookings.length === 0) {
            bookingsList.textContent = 'No bookings found.';
        } else {
            response.bookings.forEach((booking) => {
                const bookingItem = document.createElement('li');
                bookingItem.textContent = `Service: ${booking.serviceName}, Date: ${new Date(booking.bookingDate).toLocaleDateString()}`;
                bookingsList.appendChild(bookingItem);
            });
        }
    } catch (error: unknown) {
        console.error('Failed to load bookings:', error);
        bookingsList.innerHTML = 'Failed to load bookings. Please try again later.'; // Show error message
    }
}

// Add event listener for the Make Payment button
if (makePaymentButton) {
    makePaymentButton.addEventListener('click', () => {
        console.log('Make Payment button clicked.');
        // Add payment handling logic here
    });
} else {
    console.error("makePaymentButton element not found.");
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setAuthHeader(); // Set auth headers initially
    fetchServices(); // Load available services
    fetchBookings(); // Load customer bookings
});

import axios from 'axios';
