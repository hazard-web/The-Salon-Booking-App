import axios from 'axios';

// Utility functions for authentication

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The authentication token, or null if not found.
 */
export function getAuthToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log("Retrieved Token:", token);
    return token;
}

/**
 * Sets the authorization header for Axios requests.
 */
export function setAuthHeader(): void {
    const token = getAuthToken();
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        alert("You are not authenticated. Please log in.");
        window.location.href = '/login'; // Redirect to login if no token
    }
}