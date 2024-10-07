// // DOM Elements
// const paymentStatus = document.getElementById('payment-status');
// const billingDetails = document.getElementById('billing-details');
// const goHomeButton = document.getElementById('go-home');

// // API base URL
// const baseURL = 'http://localhost:4000/billing';

// // Get auth token from local storage
// function getAuthToken() {
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//         console.error("Authorization token not found.");
//         alert("You are not authenticated. Please log in.");
//         window.location.href = '/login'; // Redirect to login if no token
//     }
//     return token;
// }

// // Set authorization headers in Axios
// function setAuthHeader() {
//     const token = getAuthToken();
//     if (token) {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     }
// }

// // Generic function to handle API requests
// async function apiRequest(method, url, params = null) {
//     setAuthHeader(); // Ensure headers are set
//     try {
//         const response = await axios({ method, url, params });
//         console.log(`${method.toUpperCase()} request to ${url} succeeded:`, response.data);
//         return response.data;
//     } catch (error) {
//         console.error(`Error during ${method.toUpperCase()} request to ${url}:`, error.response ? error.response.data : error.message);
//         alert("Error fetching payment details. Please try again later.");
//         throw error;
//     }
// }

// // Function to display the success message and billing details
// async function displaySuccess() {
//     console.log("Current URL:", window.location.href);

//     // Get the session ID, amount, serviceId, and customerId from the URL parameters
//     const urlParams = new URLSearchParams(window.location.search);
//     const sessionId = urlParams.get('session_id');
//     const amount = urlParams.get('amount');  
//     const serviceId = urlParams.get('serviceId');  
//     const customerId = urlParams.get('customerId');  

//     console.log("Session ID:", sessionId);
//     console.log("Amount:", amount);
//     console.log("Service ID:", serviceId);
//     console.log("Customer ID:", customerId);

//     // Check for missing parameters
//     if (!sessionId || !amount || !serviceId || !customerId) {
//         paymentStatus.textContent = 'Missing required parameters.';
//         return;
//     }

//     try {
//         // Call your backend to retrieve payment details using the session ID
//         const response = await apiRequest('get', `${baseURL}/success`, {
//             session_id: sessionId,
//             customerId
//         });
//         console.log("Backend response:", response);

//         // Handle the backend response and display payment information
//         const billing = response.billing;
//         const paymentIntentId = response.paymentIntentId; 

//         if (billing) {
//             paymentStatus.textContent = `Amount Paid: $${(billing.amount).toFixed(2)}`; // Amount is already in dollars
//             billingDetails.textContent = `Transaction ID: ${paymentIntentId}, Status: ${billing.status}`;

//             // Store values in local storage
//             localStorage.setItem('paymentIntentId', paymentIntentId); 
//             localStorage.setItem('customerId', customerId); 
//         } else {
//             paymentStatus.textContent = 'Failed to retrieve billing details.';
//         }
//     } catch (error) {
//         console.error('Error fetching payment details:', error);
//         paymentStatus.textContent = 'Failed to retrieve payment details.';
//     }
// }

// // Add event listener for the "Go to Home" button
// goHomeButton.addEventListener('click', async () => {
//     try {
//         // Retrieve values from local storage
//         const paymentIntentId = localStorage.getItem('paymentIntentId');
//         const customerId = localStorage.getItem('customerId');
//         const sessionId = new URLSearchParams(window.location.search).get('session_id'); 

//         console.log('Retrieved Payment Intent ID:', paymentIntentId);
//         console.log('Retrieved Customer ID:', customerId);
//         console.log('Retrieved Session ID:', sessionId);
        
//         // Check for missing payment details
//         if (!paymentIntentId || !customerId || !sessionId) {
//             console.error('Payment Intent ID, Customer ID, or Session ID not found.');
//             alert('Payment details are missing. Cannot proceed.');
//             return;
//         }

//         // Make a POST request before redirecting
//         const response = await apiRequest('post', `${baseURL}/payment-success`, null, {
//             paymentIntentId, 
//             customerId,
//             sessionId 
//         });

//         // Check the response and redirect
//         if (response.status === 200) {
//             console.log('Payment processed successfully.');
//             // Redirect to billing success page with paymentIntentId in the URL
//             window.location.href = `http://localhost:4000/billing/success?paymentIntentId=${paymentIntentId}&customerId=${customerId}&session_id=${sessionId}`;
//         } else {
//             console.error('POST request failed:', response.status);
//             alert('Failed to complete payment. Please try again.');
//         }
//     } catch (error) {
//         console.error('Error making POST request:', error);
//         alert('Error processing your request. Please try again.');
//     }
// });

// // Initialize the page
// document.addEventListener('DOMContentLoaded', () => {
//     displaySuccess(); // Run the display success function on page load
// });
