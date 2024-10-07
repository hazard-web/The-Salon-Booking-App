// // DOM elements
// const paymentForm = document.getElementById('payment-form');
// let serviceSelect = document.getElementById('service');  // Changed 'const' to 'let' in case this is reassigned later
// const paymentResult = document.getElementById('payment-result');
// const fetchBillingButton = document.getElementById('fetch-billing');
// const billingHistoryList = document.getElementById('billing-history');

// // API base URL
// const baseURL = 'http://localhost:4000/billing';

// // Get auth token from local storage
// function getAuthToken() {
//     const token = localStorage.getItem('authToken');
//     console.log("Retrieved Token:", token);
//     return token;
// }

// // Set authorization headers in Axios
// function setAuthHeader() {
//     const token = getAuthToken();
//     if (token) {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     } else {
//         alert("You are not authenticated. Please log in.");
//         window.location.href = '/login'; // Redirect to login if no token
//     }
// }


// // Generic function to handle API requests
// async function apiRequest(method, url, data) {
//     const token = localStorage.getItem('authToken'); // Get the token from local storage

//     const config = {
//         method: method,
//         url: url,
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}` // Add Bearer token to the headers
//         },
//         data: JSON.stringify(data) // Convert data to JSON
//     };

//     try {
//         const response = await axios(config);
//         return response.data; // Return the data from the response
//     } catch (error) {
//         const errorMsg = error.response && error.response.data.error
//             ? error.response.data.error
//             : error.message || 'An unknown error occurred';
//         throw new Error(errorMsg); // Throw the formatted error
//     }
// }


// // Fetch services and populate the dropdown
// async function fetchServices() {
//     try {
//         const services = await apiRequest('get', `${baseURL}/services`); // Adjust the endpoint as needed

//         // Clear existing options, except the placeholder
//         serviceSelect.innerHTML = '<option value="" disabled selected>Select a service</option>';

//         // Populate the dropdown with services
//         services.forEach(service => {
//             const option = document.createElement('option');
//             option.value = service.id; // Adjust based on your service object structure
//             option.textContent = `${service.name} - $${(service.price / 100).toFixed(2)}`; // Display name and price
//             option.setAttribute('data-price', service.price); // Store price in a data attribute
//             serviceSelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error fetching services:', error);
//         alert('Could not load services. Please try again later.');
//     }
// }

// // Handle the payment form submission
// async function handlePayment(event) {
//     event.preventDefault(); // Prevent default form submission
//     const serviceId = serviceSelect.value; // Get selected service ID

//     console.log("Selected Service ID:", serviceId); // Log the service ID for debugging

//     // Basic validation
//     if (!serviceId) {
//         paymentResult.innerHTML = 'Please select a service.';
//         return;
//     }

//     // Get the amount based on selected service
//     const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
//     const amount = selectedOption.getAttribute('data-price'); // Get the price from the data attribute

//     if (!amount) {
//         paymentResult.innerHTML = 'Invalid service amount.';
//         return;
//     }

//     paymentResult.innerHTML = 'Redirecting to payment...'; // Show loading state

//     try {
//         // Log the payload before making the request
//         const payload = { amount: parseFloat(amount), serviceId }; // Ensure amount is a float
//         console.log("Payload:", payload); // Log the payload

//         // Create a Checkout session by sending a POST request to the backend
//         const response = await apiRequest('post', `${baseURL}/create-checkout-session`, payload); // Updated URL

//         // Check if the response contains the sessionId and clientSecret
//         const { sessionId } = response; // Use session ID from response
//         const stripe = Stripe('pk_test_51Q2w3x076nAiqwu6YzmCjj6JWql8gqbx97XKAzRFuDiKCmUZgHceMo9nACy8mXpl8oBAvhxOphLugAv7Ba2mEetN00x5MXVbOr'); 
        
//         // Redirect to Stripe Checkout
//         await stripe.redirectToCheckout({ sessionId });

//     } catch (error) {
//         paymentResult.innerHTML = `Error: ${error.message}`;
//         console.error('Payment error:', error);
//     }
// }


// // Check payment success after redirection from Stripe
// async function checkPaymentSuccess() {
//     // Get the session ID from the URL parameters
//     const urlParams = new URLSearchParams(window.location.search);
//     const sessionId = urlParams.get('session_id');

//     if (sessionId) {
//         try {
//             // Retrieve payment intent details using the session ID
//             const response = await apiRequest('post', `${baseURL}/payment-success`, {
//                 sessionId: sessionId // Send session ID to your payment success endpoint
//             });

//             // Assuming your backend returns the paymentIntentId and customerId in the response
//             const { paymentIntentId, customerId } = response;

//             // Call the backend payment success method with necessary data
//             const paymentResponse = await apiRequest('post', `${baseURL}/payment-success`, {
//                 paymentIntentId,
//                 customerId,
//             });

//             // Display the successful payment message
//             paymentResult.innerHTML = `Payment successful! Amount: $${(paymentResponse.billing.amount).toFixed(2)}`; // Show success message
//         } catch (error) {
//             paymentResult.innerHTML = `Payment processing failed: ${error.message}`;
//             console.error('Error processing payment success:', error);
//         }
//     }
// }

// // Fetch billing history
// async function fetchBillingHistory() {
//     billingHistoryList.innerHTML = 'Loading billing history...'; // Show loading state

//     try {
//         const billingHistory = await apiRequest('get', `${baseURL}/billing-history`);

//         billingHistoryList.innerHTML = ''; // Clear previous entries

//         // Check if billing history is empty
//         if (billingHistory.length === 0) {
//             billingHistoryList.innerHTML = 'No billing history found.';
//             return;
//         }

//         // Display billing history
//         billingHistory.forEach(bill => {
//             const listItem = document.createElement('li');
//             listItem.textContent = `Amount: $${(bill.amount / 100).toFixed(2)}, Status: ${bill.status}`; // Convert to dollars
//             billingHistoryList.appendChild(listItem);
//         });
//     } catch (error) {
//         const errorMsg = error.response && error.response.data.error
//             ? error.response.data.error
//             : error.message;
//         billingHistoryList.innerHTML = `Error fetching billing history: ${errorMsg}`;
//         console.error('Billing history error:', error);
//     }
// }

// // Initialize the page
// document.addEventListener('DOMContentLoaded', () => {
//     setAuthHeader(); // Set auth headers initially
//     fetchServices(); // Fetch services on page load
//     paymentForm.addEventListener('submit', handlePayment); // Handle form submission for payments
//     fetchBillingButton.addEventListener('click', fetchBillingHistory); // Fetch billing history on button click
//     checkPaymentSuccess(); // Check for payment success on page load
// });

// DOM elements
const paymentForm = document.getElementById('payment-form');
let serviceSelect = document.getElementById('service');  // Changed 'const' to 'let' in case this is reassigned later
const paymentResult = document.getElementById('payment-result');
const fetchBillingButton = document.getElementById('fetch-billing');
const billingHistoryList = document.getElementById('billing-history');

// API base URL
const baseURL = 'http://localhost:4000/billing';

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
async function apiRequest(method, url, data) {
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
    } catch (error) {
        const errorMsg = error.response && error.response.data.error
            ? error.response.data.error
            : error.message || 'An unknown error occurred';
        throw new Error(errorMsg); // Throw the formatted error
    }
}

// Fetch services and populate the dropdown
async function fetchServices() {
    try {
        const services = await apiRequest('get', `${baseURL}/services`); // Adjust the endpoint as needed

        // Clear existing options, except the placeholder
        serviceSelect.innerHTML = '<option value="" disabled selected>Select a service</option>';

        // Populate the dropdown with services
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id; // Adjust based on your service object structure
            option.textContent = `${service.name} - $${(service.price / 100).toFixed(2)}`; // Display name and price
            option.setAttribute('data-price', service.price); // Store price in a data attribute
            serviceSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        alert('Could not load services. Please try again later.');
    }
}

// Handle the payment form submission
async function handlePayment(event) {
    event.preventDefault(); // Prevent default form submission
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
        // Prepare the payload for the API call
        const payload = { amount: parseFloat(amount), serviceId }; // Ensure amount is a float
        console.log("Payload:", payload); // Log the payload

        // Create a Razorpay order by sending a POST request to the backend
        const response = await apiRequest('post', `${baseURL}/create-checkout-session`, payload); // Updated URL for Razorpay

        // Extract the order ID and amount from the response
        const { orderId, amount: orderAmount, currency } = response;

        // Configure Razorpay options
        const options = {
            key: 'rzp_test_oSHBC2DHa0YCdM', // Replace with your Razorpay API key
            amount: orderAmount, // Amount is in paise, so 50000 paise = 500 INR
            currency: currency,
            name: "Your Company Name",
            description: "Payment for service",
            order_id: orderId, // Razorpay order ID
            handler: async function (response) {
                console.log('Razorpay response:', response);  // Debugging log
            
                try {
                    const paymentResponse = await apiRequest('post', `${baseURL}/payment-success`, {
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature
                    });
            
                    // Handle successful response
                    paymentResult.innerHTML = `Payment successful! Amount: ₹${(paymentResponse.billing.amount).toFixed(2)}`;
                } catch (error) {
                    paymentResult.innerHTML = `Payment verification failed: ${error.message}`;
                }
            },
            prefill: {
                name: "Customer Name", // You can prefill customer details here
                email: "customer@example.com",
                contact: "9999999999"
            },
            theme: {
                color: "#3399cc"
            }
        };

        // Open the Razorpay payment interface
        const rzp1 = new Razorpay(options);
        rzp1.open();

    } catch (error) {
        paymentResult.innerHTML = `Error: ${error.message}`;
        console.error('Payment error:', error);
    }
}

// Fetch billing history
async function fetchBillingHistory() {
    billingHistoryList.innerHTML = 'Loading billing history...'; // Show loading state

    try {
        const billingHistory = await apiRequest('get', `${baseURL}/billing-history`);

        billingHistoryList.innerHTML = ''; // Clear previous entries

        // Check if billing history is empty
        if (billingHistory.length === 0) {
            billingHistoryList.innerHTML = 'No billing history found.';
            return;
        }

        // Display billing history
        billingHistory.forEach(bill => {
            const listItem = document.createElement('li');
            listItem.textContent = `Amount: $${(bill.amount / 100).toFixed(2)}, Status: ${bill.status}`; // Convert to dollars
            billingHistoryList.appendChild(listItem);
        });
    } catch (error) {
        const errorMsg = error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        billingHistoryList.innerHTML = `Error fetching billing history: ${errorMsg}`;
        console.error('Billing history error:', error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setAuthHeader(); // Set auth headers initially
    fetchServices(); // Fetch services on page load
    paymentForm.addEventListener('submit', handlePayment); // Handle form submission for payments
    fetchBillingButton.addEventListener('click', fetchBillingHistory); // Fetch billing history on button click
});
