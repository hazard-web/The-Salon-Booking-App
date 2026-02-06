document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const getPhotosForm = document.getElementById('getPhotosForm');
    const photoList = document.getElementById('photoList');

    // Upload photo function
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const description = document.getElementById('photo-description').value;
        const serviceId = document.getElementById('service-id').value;
        const fileInput = document.getElementById('photo-file').files[0];

        const formData = new FormData();
        formData.append('description', description);
        formData.append('serviceId', serviceId);
        formData.append('photo', fileInput);

        try {
            const response = await axios.post('/photo/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Photo uploaded successfully!');
            uploadForm.reset(); // Clear the form
        } catch (error) {
            console.error('Error uploading photo:', error.response ? error.response.data : error.message);
            alert('Failed to upload photo.');
        }
    });

    // Get service photos function
    getPhotosForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const serviceId = document.getElementById('serviceId').value;

        try {
            const response = await axios.get(`photo/service/${serviceId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const photos = response.data;
            photoList.innerHTML = ''; // Clear the list

            if (photos.length > 0) {
                photos.forEach(photo => {
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
        } catch (error) {
            console.error('Error retrieving photos:', error.response ? error.response.data : error.message);
            alert('Failed to load photos.');
        }
    });
});
