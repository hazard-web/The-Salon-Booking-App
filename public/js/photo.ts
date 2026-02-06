import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    // Refine DOM element types
    const uploadForm = document.getElementById('uploadForm') as HTMLFormElement;
    const photoList = document.getElementById('photoList') as HTMLElement;
    const getPhotosForm = document.getElementById('getPhotosForm') as HTMLFormElement;

    // Refine DOM element handling with stricter checks
    const descriptionInput = document.getElementById('photo-description') as HTMLInputElement | null;
    const serviceIdInput = document.getElementById('service-id') as HTMLInputElement | null;
    const fileInputElement = document.getElementById('photo-file') as HTMLInputElement | null;

    if (descriptionInput && serviceIdInput && fileInputElement) {
        const description = descriptionInput!.value; // Non-null assertion
        const serviceId = serviceIdInput!.value; // Non-null assertion
        const fileInput = fileInputElement!.files ? fileInputElement!.files[0] : null; // Non-null assertion

        if (fileInput) {
            const formData = new FormData();
            formData.append('photo', fileInput as Blob); // Ensure fileInput is treated as Blob
            formData.append('description', description);
            formData.append('serviceId', serviceId);

            // Proceed with the upload logic
        } else {
            console.error('No file selected for upload.');
        }
    } else {
        console.error('One or more required input elements are missing or of incorrect type.');
    }

    // Upload photo function
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const description = descriptionInput!.value;
        const serviceId = serviceIdInput!.value;
        const fileInput = fileInputElement!.files ? fileInputElement!.files[0] : null;

        const formData = new FormData();
        formData.append('description', description);
        formData.append('serviceId', serviceId);
        formData.append('photo', fileInput as Blob); // Ensure fileInput is treated as Blob

        try {
            const response = await axios.post('/photo/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Photo uploaded successfully!');
            uploadForm.reset(); // Clear the form
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error uploading photo:', error.message);
            }
            alert('Failed to upload photo.');
        }
    });

    // Get service photos function
    getPhotosForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const serviceIdElement = document.getElementById('serviceId') as HTMLInputElement | null;
        let serviceId: string | null = null;
        if (serviceIdElement) {
            serviceId = serviceIdElement!.value; // Non-null assertion
        } else {
            console.error('Service ID element is missing or of incorrect type.');
        }

        try {
            if (serviceId) {
                const response = await axios.get(`photo/service/${serviceId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const photos = response.data as Array<{ id: string; url: string; description: string }>;
                photoList.innerHTML = ''; // Clear the list

                if (photos.length > 0) {
                    photos.forEach((photo) => {
                        const photoItem = document.createElement('div');
                        photoItem.classList.add('photo-item');
                        photoItem.innerHTML = `
                            <img src="${photo.url}" alt="${photo.description}">
                            <p>${photo.description}</p>
                        `;
                        photoList.appendChild(photoItem);
                    });
                } else {
                    photoList.innerHTML = '<p>No photos found for this service.</p>';
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error retrieving photos:', error.message);
            }
            alert('Failed to load photos.');
        }
    });
});
