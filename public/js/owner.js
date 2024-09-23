// DOM elements
const registerSalonForm = document.getElementById("register-salon-form");
const registerSalonResult = document.getElementById("register-salon-result");

const addServiceForm = document.getElementById("add-service-form");
const addServiceResult = document.getElementById("add-service-result");

const getServicesForm = document.getElementById("get-services-form");
const getServicesResult = document.getElementById("get-services-result");

const getAppointmentsForm = document.getElementById("get-appointments-form");
const getAppointmentsResult = document.getElementById("get-appointments-result");

const getHistoryForm = document.getElementById("get-history-form");
const getHistoryResult = document.getElementById("get-history-result");

// API base URL
const baseURL = 'http://localhost:4000/owner';

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
async function apiRequest(method, url, data = null) {
    setAuthHeader(); // Ensure headers are set
    try {
        const response = await axios({ method, url, data });
        console.log(`${method.toUpperCase()} request to ${url} succeeded:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error during ${method.toUpperCase()} request to ${url}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to handle salon registration
async function handleRegisterSalon(event) {
    event.preventDefault();
    const salonName = document.getElementById('salon-name').value;
    const salonAddress = document.getElementById('salon-address').value;
    const salonPhone = document.getElementById('salon-phone').value;

    try {
        const response = await apiRequest('post', `${baseURL}/register-salon`, { name: salonName, address: salonAddress, phone: salonPhone });
        registerSalonResult.textContent = response.message; // Assuming response has a message field
        registerSalonForm.reset(); // Reset form
    } catch (error) {
        registerSalonResult.textContent = 'Failed to register salon. Please try again.';
    }
}

// Function to handle adding a service
async function handleAddService(event) {
    event.preventDefault();
    const serviceName = document.getElementById('service-name').value;
    const serviceDescription = document.getElementById('service-description').value;
    const servicePrice = document.getElementById('service-price').value;
    const serviceDuration = document.getElementById('service-duration').value;
    const salonId = document.getElementById('salon-id').value;

    try {
        const response = await apiRequest('post', `${baseURL}/add-service`, {
            name: serviceName,
            description: serviceDescription,
            price: servicePrice,
            duration: serviceDuration,
            salonId: salonId,
        });
        addServiceResult.textContent = response.message; // Assuming response has a message field
        addServiceForm.reset(); // Reset form
    } catch (error) {
        addServiceResult.textContent = 'Failed to add service. Please try again.';
    }
}

// Function to get all services of a salon
async function handleGetServices(event) {
    event.preventDefault();
    const salonId = document.getElementById('get-salon-id').value;
    getServicesResult.innerHTML = 'Loading services...';

    try {
        const services = await apiRequest('get', `${baseURL}/salon-services/${salonId}`);
        getServicesResult.innerHTML = ''; // Clear previous results
        if (services.length > 0) {
            services.forEach(service => {
                const serviceItem = document.createElement('div');
                serviceItem.textContent = `Service: ${service.name}, Price: $${service.price}`;
                getServicesResult.appendChild(serviceItem);
            });
        } else {
            getServicesResult.textContent = 'No services found for this salon.';
        }
    } catch (error) {
        getServicesResult.textContent = 'Failed to load services. Please try again.';
    }
}

// Function to get appointments of a salon
async function handleGetAppointments(event) {
    event.preventDefault();
    const salonId = document.getElementById('appointments-salon-id').value;
    getAppointmentsResult.innerHTML = 'Loading appointments...';

    try {
        const appointments = await apiRequest('get', `${baseURL}/appointments/${salonId}`);
        getAppointmentsResult.innerHTML = ''; // Clear previous results
        if (appointments.length > 0) {
            appointments.forEach(appointment => {
                const appointmentItem = document.createElement('div');
                appointmentItem.textContent = `Appointment for: ${appointment.serviceName} on ${appointment.date}`;
                getAppointmentsResult.appendChild(appointmentItem);
            });
        } else {
            getAppointmentsResult.textContent = 'No appointments found for this salon.';
        }
    } catch (error) {
        getAppointmentsResult.textContent = 'Failed to load appointments. Please try again.';
    }
}

// Function to get service history of a salon
async function handleGetHistory(event) {
    event.preventDefault();
    const salonId = document.getElementById('history-salon-id').value;
    getHistoryResult.innerHTML = 'Loading service history...';

    try {
        const history = await apiRequest('get', `${baseURL}/service-history/${salonId}`);
        getHistoryResult.innerHTML = ''; // Clear previous results
        if (history.length > 0) {
            history.forEach(entry => {
                const historyItem = document.createElement('div');
                historyItem.textContent = `Service: ${entry.serviceName}, Date: ${entry.date}, Customer: ${entry.customerName}`;
                getHistoryResult.appendChild(historyItem);
            });
        } else {
            getHistoryResult.textContent = 'No service history found for this salon.';
        }
    } catch (error) {
        getHistoryResult.textContent = 'Failed to load service history. Please try again.';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setAuthHeader(); // Set auth headers initially
    registerSalonForm.addEventListener('submit', handleRegisterSalon);
    addServiceForm.addEventListener('submit', handleAddService);
    getServicesForm.addEventListener('submit', handleGetServices);
    getAppointmentsForm.addEventListener('submit', handleGetAppointments);
    getHistoryForm.addEventListener('submit', handleGetHistory);
});
