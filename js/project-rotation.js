// Project Image Rotation
document.addEventListener('DOMContentLoaded', () => {
    // Define images for each rotating project
    const projectImages = {
        'real-estate-project': [
            'images/real-estate-dbms.png',
            'images/admin-dashboard.png',
            'images/agent-dashboard.png'
        ],
        'roadsense-project': [
            'images/RoadSense.png',
            'images/RoadSense-poster.png'
        ]
    };

    // Initialize rotation for each project
    Object.keys(projectImages).forEach(projectId => {
        const element = document.getElementById(projectId);
        if (element && projectImages[projectId].length > 1) {
            let currentIndex = 0;
            const images = projectImages[projectId];

            setInterval(() => {
                currentIndex = (currentIndex + 1) % images.length;
                element.style.backgroundImage = `url('${images[currentIndex]}')`;
            }, 2000); // Change every 5 seconds
        }
    });
});
