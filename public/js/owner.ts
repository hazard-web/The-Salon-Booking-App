import axios from 'axios'; // Import axios
import { getAuthToken, setAuthHeader } from '../../utils/authHelpers'; // Import auth helpers

// Ensure `baseURL` is declared only once
const baseURL = 'http://localhost:4000/owner';

// Generic function to handle API requests
async function apiRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, data: any = null): Promise<any> {
    setAuthHeader(); // Ensure headers are set
    try {
        const response = await axios({ method, url, data });
        console.log(`${method.toUpperCase()} request to ${url} succeeded:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Error during ${method.toUpperCase()} request to ${url}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to handle salon registration
async function handleRegisterSalon(event: Event): Promise<void> {
    event.preventDefault();
    if (!registerSalonForm || !registerSalonResult) return;

    const salonName = (document.getElementById('salon-name') as HTMLInputElement | null)?.value || '';
    const salonAddress = (document.getElementById('salon-address') as HTMLInputElement | null)?.value || '';
    const salonPhone = (document.getElementById('salon-phone') as HTMLInputElement | null)?.value || '';

    if (!salonName || !salonAddress || !salonPhone) {
        registerSalonResult.textContent = 'All fields are required.';
        return;
    }

    try {
        const response = await apiRequest('post', `${baseURL}/register-salon`, { name: salonName, address: salonAddress, phone: salonPhone });
        registerSalonResult.textContent = response.message; // Assuming response has a message field
        registerSalonForm.reset(); // Reset form
    } catch (error) {
        registerSalonResult.textContent = 'Failed to register salon. Please try again.';
    }
}

// Function to handle adding a service
async function handleAddService(event: Event): Promise<void> {
    event.preventDefault();
    if (!addServiceForm || !addServiceResult) return;

    const serviceName = (document.getElementById('service-name') as HTMLInputElement | null)?.value;
    const serviceDescription = (document.getElementById('service-description') as HTMLInputElement | null)?.value;
    const servicePrice = (document.getElementById('service-price') as HTMLInputElement | null)?.value;
    const serviceDuration = (document.getElementById('service-duration') as HTMLInputElement | null)?.value;
    const salonId = (document.getElementById('salon-id') as HTMLInputElement | null)?.value;

    if (!serviceName || !serviceDescription || !servicePrice || !serviceDuration || !salonId) {
        addServiceResult.textContent = 'All fields are required.';
        return;
    }

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
async function handleGetServices(event: Event): Promise<void> {
    event.preventDefault();
    if (!getServicesForm || !getServicesResult) return;

    const salonId = (document.getElementById('get-salon-id') as HTMLInputElement | null)?.value;
    getServicesResult.innerHTML = 'Loading services...';

    try {
        const services = await apiRequest('get', `${baseURL}/salon-services/${salonId}`);
        getServicesResult.innerHTML = ''; // Clear previous results
        if (services.length > 0) {
            services.forEach((service: { name: string; price: number }) => {
                const serviceItem = document.createElement('div');
                serviceItem.textContent = `Service: ${service.name}, Price: ₹${service.price}`;
                getServicesResult?.appendChild(serviceItem);
            });
        } else {
            getServicesResult.textContent = 'No services found for this salon.';
        }
    } catch (error) {
        getServicesResult.textContent = 'Failed to load services. Please try again.';
    }
}

// Function to get appointments of a salon
async function handleGetAppointments(event: Event): Promise<void> {
    event.preventDefault();
    if (!getAppointmentsForm || !getAppointmentsResult) return;

    const salonId = (document.getElementById('appointments-salon-id') as HTMLInputElement | null)?.value;
    getAppointmentsResult.innerHTML = 'Loading appointments...';

    try {
        const appointments = await apiRequest('get', `${baseURL}/appointments/${salonId}`);
        console.log(appointments); // Log the appointments for inspection
        getAppointmentsResult.innerHTML = ''; // Clear previous results
        
        if (appointments.length > 0) {
            appointments.forEach((appointment: { Service: { name: string }; bookingDate: string }) => {
                const appointmentItem = document.createElement('div');
                const serviceName = appointment.Service ? appointment.Service.name : 'Unknown Service';
                const bookingDate = appointment.bookingDate ? new Date(appointment.bookingDate).toLocaleString() : 'Unknown Date';
                appointmentItem.textContent = `Appointment for: ${serviceName} on ${bookingDate}`;
                getAppointmentsResult?.appendChild(appointmentItem);
            });
        } else {
            getAppointmentsResult.textContent = 'No appointments found for this salon.';
        }
    } catch (error) {
        console.error('Error during GET request:', error); // Log the error for debugging
        getAppointmentsResult.textContent = 'Failed to load appointments. Please try again.';
    }
}


// Function to get service history of a salon
async function handleGetHistory(event: Event): Promise<void> {
    event.preventDefault();
    if (!getHistoryForm || !getHistoryResult) return;

    const salonId = (document.getElementById('history-salon-id') as HTMLInputElement | null)?.value;
    getHistoryResult.innerHTML = 'Loading service history...';

    try {
        const history = await apiRequest('get', `${baseURL}/service-history/${salonId}`);
        getHistoryResult.innerHTML = ''; // Clear previous results
        if (history.length > 0) {
            history.forEach((entry: { serviceName: string; date: string; customerName: string }) => {
                const historyItem = document.createElement('div');
                historyItem.textContent = `Service: ${entry.serviceName}, Date: ${entry.date}, Customer: ${entry.customerName}`;
                getHistoryResult?.appendChild(historyItem);
            });
        } else {
            getHistoryResult.textContent = 'No service history found for this salon.';
        }
    } catch (error) {
        getHistoryResult.textContent = 'Failed to load service history. Please try again.';
    }
}

// Ensure proper declarations for DOM elements
const registerSalonForm = document.getElementById("register-salon-form") as HTMLFormElement | null;
const registerSalonResult = document.getElementById("register-salon-result") as HTMLElement | null;

const addServiceForm = document.getElementById("add-service-form") as HTMLFormElement | null;
const addServiceResult = document.getElementById("add-service-result") as HTMLElement | null;

const getServicesForm = document.getElementById("get-services-form") as HTMLFormElement | null;
const getServicesResult = document.getElementById("get-services-result") as HTMLElement | null;

const getAppointmentsForm = document.getElementById("get-appointments-form") as HTMLFormElement | null;
const getAppointmentsResult = document.getElementById("get-appointments-result") as HTMLElement | null;

const getHistoryForm = document.getElementById("get-history-form") as HTMLFormElement | null;
const getHistoryResult = document.getElementById("get-history-result") as HTMLElement | null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setAuthHeader(); // Set auth headers initially

    if (registerSalonForm) {
        registerSalonForm.addEventListener('submit', handleRegisterSalon);
    }

    if (addServiceForm) {
        addServiceForm.addEventListener('submit', handleAddService);
    }

    if (getServicesForm) {
        getServicesForm.addEventListener('submit', handleGetServices);
    }

    if (getAppointmentsForm) {
        getAppointmentsForm.addEventListener('submit', handleGetAppointments);
    }

    if (getHistoryForm) {
        getHistoryForm.addEventListener('submit', handleGetHistory);
    }
});
