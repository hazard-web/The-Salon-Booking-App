// DOM elements
const usersList = document.getElementById("users-list") as HTMLElement | null;
const salonsList = document.getElementById("salons-list") as HTMLElement | null;
const bookingsList = document.getElementById("bookings-list") as HTMLElement | null;

// API base URL for admin routes
const adminBaseURL = 'http://localhost:4000/admin';

// Get auth token from local storage
import { getAuthToken } from '../../utils/authHelpers';

// Set authorization headers in Axios
import { setAuthHeader } from '../../utils/authHelpers';

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
        alert("Error occurred. Please try again later.");
        throw error;
    }
}

// Function to fetch and display all users
async function fetchUsers(): Promise<void> {
    if (!usersList) {
        console.error("usersList element not found.");
        return;
    }
    usersList.innerHTML = 'Loading users...'; // Show loading state
    try {
        const users: Array<{ id: string; username: string; email: string }> = await apiRequest('get', `${adminBaseURL}/users`);
        usersList.innerHTML = ''; // Clear loading state
        if (users.length > 0) {
            users.forEach((user) => {
                const userItem = document.createElement('li');
                userItem.innerHTML = `
                    ${user.username} (${user.email})
                    <button class="access-btn" data-id="${user.id}">Access</button>
                `;
                usersList.appendChild(userItem);

                // Adding event listener for access button
                const accessBtn = userItem.querySelector('.access-btn');
                if (accessBtn) {
                    accessBtn.addEventListener('click', (e) => {
                        const target = e.target as HTMLElement;
                        const userId = target.getAttribute('data-id');
                        if (userId) {
                            console.log(`Accessing user with ID: ${userId}`); // Debugging line
                            accessUser(userId);
                        }
                    });
                }
            });
        } else {
            usersList.innerHTML = 'No users found.';
        }
    } catch (error: unknown) {
        usersList.innerHTML = 'Failed to load users. Please try again later.';
        console.error('Failed to load users:', error);
    }
}

// Function to fetch and display all salons
async function fetchSalons(): Promise<void> {
    if (!salonsList) {
        console.error("salonsList element not found.");
        return;
    }
    salonsList.innerHTML = 'Loading salons...'; // Show loading state
    try {
        const salons: Array<{ id: string; name: string; User: { username: string; email: string } }> = await apiRequest('get', `${adminBaseURL}/salons`);
        salonsList.innerHTML = ''; // Clear loading state
        if (salons.length > 0) {
            salons.forEach((salon) => {
                const salonItem = document.createElement('li');
                salonItem.innerHTML = `
                    <strong>${salon.name}</strong> - Owned by: ${salon.User.username} (${salon.User.email})
                    <button class="approve-btn" data-id="${salon.id}" data-approved="true">Approve</button>
                    <button class="disapprove-btn" data-id="${salon.id}" data-approved="false">Disapprove</button>
                `;
                salonsList.appendChild(salonItem);

                // Add event listeners for approve/disapprove buttons
                const approveBtn = salonItem.querySelector('.approve-btn');
                const disapproveBtn = salonItem.querySelector('.disapprove-btn');

                [approveBtn, disapproveBtn].forEach((button) => {
                    if (button) {
                        button.addEventListener('click', (e) => {
                            const target = e.target as HTMLElement;
                            const salonId = target.getAttribute('data-id');
                            const approved = target.getAttribute('data-approved') === 'true';
                            if (salonId) {
                                console.log(`Salon ID: ${salonId}, Approved: ${approved}`); // Debugging line
                                approveSalon(salonId, approved);
                            }
                        });
                    }
                });
            });
        } else {
            salonsList.innerHTML = 'No salons found.';
        }
    } catch (error: unknown) {
        salonsList.innerHTML = 'Failed to load salons. Please try again later.';
        console.error('Failed to load salons:', error);
    }
}

// Function to approve/disapprove a salon
async function approveSalon(salonId: string, approved: boolean): Promise<void> {
    try {
        const response = await apiRequest('post', `${adminBaseURL}/approve-salon`, { salonId, approved });
        console.log(`Salon ${approved ? 'approved' : 'disapproved'} successfully:`, response);
        fetchSalons(); // Refresh salons list after approving/disapproving
    } catch (error) {
        console.error(`Failed to ${approved ? 'approve' : 'disapprove'} salon:`, error);
    }
}

// Function to fetch and display all bookings
async function fetchBookings(): Promise<void> {
    if (!bookingsList) {
        console.error("bookingsList element not found.");
        return;
    }
    bookingsList.innerHTML = 'Loading bookings...'; // Show loading state
    try {
        const bookings: Array<{ id: string; Service: { name: string; }; customer: { username: string; }; bookingDate: string }> = await apiRequest('get', `${adminBaseURL}/bookings`);
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
    } catch (error: unknown) {
        bookingsList.innerHTML = 'Failed to load bookings. Please try again later.';
        console.error('Failed to load bookings:', error);
    }
}


// Function to access a user
async function accessUser(userId: string): Promise<void> {
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

import axios from 'axios';
