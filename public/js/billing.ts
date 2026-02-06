import axios from 'axios';

/**
 * Declare the global Razorpay object to satisfy TypeScript.
 */
declare const Razorpay: any;

// DOM elements
const paymentForm = document.getElementById('payment-form') as HTMLFormElement | null;
const serviceSelect = document.getElementById('service') as HTMLSelectElement | null;
const paymentResult = document.getElementById('payment-result') as HTMLElement | null;
const fetchBillingButton = document.getElementById('fetch-billing') as HTMLButtonElement | null;
const billingHistoryList = document.getElementById('billing-history') as HTMLElement | null;

// API base URL
const baseURL = 'http://localhost:4000/billing';

// Generic function to handle API requests
async function apiRequest(method: string, url: string, data: object | null): Promise<any> {
    const token = localStorage.getItem('authToken'); // Get the token from local storage

    const config = {
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add Bearer token to the headers
        },
        data: JSON.stringify(data) // Convert data to JSON
    };

    try {
        const response = await axios(config);
        return response.data; // Return the data from the response
    } catch (error: unknown) {
        if (error instanceof Error) {
            const errorMsg = (error as any).response && (error as any).response.data.error
                ? (error as any).response.data.error
                : error.message || 'An unknown error occurred';
            throw new Error(errorMsg); // Throw the formatted error
        } else {
            throw new Error('An unknown error occurred.');
        }
    }
}

// Fetch services and populate the dropdown
async function fetchServices(): Promise<void> {
    if (!serviceSelect) {
        console.error("serviceSelect element not found.");
        return;
    }
    try {
        const services: Array<{ id: string; name: string; price: number }> = await apiRequest('get', `${baseURL}/services`, null); // Adjust the endpoint as needed

        // Clear existing options, except the placeholder
        serviceSelect.innerHTML = '<option value="" disabled selected>Select a service</option>';

        // Populate the dropdown with services
        services.forEach((service) => {
            const option = document.createElement('option');
            option.value = service.id; // Adjust based on your service object structure
            option.textContent = `${service.name} - ₹${(service.price).toFixed(2)}`; // Display name and price
            option.setAttribute('data-price', service.price.toString()); // Store price in a data attribute
            serviceSelect.appendChild(option);
        });
    } catch (error: unknown) {
        console.error('Error fetching services:', error);
        alert('Could not load services. Please try again later.');
    }
}

// Handle the payment form submission
async function handlePayment(event: Event): Promise<void> {
    event.preventDefault(); // Prevent default form submission
    if (!serviceSelect || !paymentResult) {
        console.error("Required DOM elements not found.");
        return;
    }

    const serviceId = serviceSelect.value; // Get selected service ID

    console.log("Selected Service ID:", serviceId); // Log the service ID for debugging

    // Basic validation
    if (!serviceId) {
        paymentResult.innerHTML = 'Please select a service.';
        return;
    }

    // Get the amount based on selected service
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const amount = selectedOption.getAttribute('data-price'); // Get the price from the data attribute

    if (!amount) {
        paymentResult.innerHTML = 'Invalid service amount.';
        return;
    }

    paymentResult.innerHTML = 'Redirecting to payment...'; // Show loading state

    try {
        const response: { orderId: string; amount: number; currency: string } = await apiRequest('post', `${baseURL}/create-checkout-session`, { serviceId, amount });

        const options = {
            key: 'rzp_test_oSHBC2DHa0YCdM', // Replace with your Razorpay key
            amount: response.amount,
            currency: response.currency,
            name: 'Salon Service Payment',
            description: 'Payment for salon services',
            order_id: response.orderId,
            handler: async function (paymentResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
                try {
                    const verificationResponse: { billing: { amount: number } } = await apiRequest('post', `${baseURL}/payment-success`, paymentResponse);
                    paymentResult.innerHTML = `Payment successful! Amount: ₹${(verificationResponse.billing.amount).toFixed(2)}`;
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        paymentResult.innerHTML = `Payment verification failed: ${error.message}`;
                    }
                }
            },
            theme: {
                color: '#F37254'
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
    } catch (error: unknown) {
        if (error instanceof Error) {
            paymentResult.innerHTML = `Error: ${error.message}`;
        }
    }
}

// Fetch billing history
async function fetchBillingHistory(): Promise<void> {
    if (!billingHistoryList) {
        console.error("Required DOM element 'billingHistoryList' not found.");
        return;
    }

    billingHistoryList.innerHTML = 'Loading billing history...'; // Show loading state

    try {
        const billingHistory: Array<{ id: string; amount: number; date: string }> = await apiRequest('get', `${baseURL}/billing-history`, {});

        billingHistoryList.innerHTML = ''; // Clear previous entries

        if (billingHistory.length === 0) {
            billingHistoryList.innerHTML = 'No billing history found.';
            return;
        }

        billingHistory.forEach((bill: { id: string; amount: number; date: string }) => {
            const listItem = document.createElement('li');
            listItem.textContent = `ID: ${bill.id}, Amount: ₹${bill.amount.toFixed(2)}, Date: ${bill.date}`;
            billingHistoryList.appendChild(listItem);
        });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error && error.message
            ? error.message
            : 'An unknown error occurred.';
        billingHistoryList.innerHTML = `Error fetching billing history: ${errorMsg}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchServices(); // Fetch services on page load
    paymentForm?.addEventListener('submit', handlePayment); // Handle form submission for payments
    fetchBillingButton?.addEventListener('click', fetchBillingHistory); // Fetch billing history on button click
});
