// carImages.js
window.carImages = (function() {
    const STORAGE_KEY = 'worldframe_car_images';

    function loadImages() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    function saveImages(images) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    }

    function getImageUrl(carName) {
        const images = loadImages();
        return images[carName] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#2a2a2a"/><text x="50" y="55" font-size="30" text-anchor="middle" fill="#666">🚗</text></svg>';
    }

    function setImageUrl(carName, imageUrl) {
        const images = loadImages();
        images[carName] = imageUrl;
        saveImages(images);
    }

    return {
        getImageUrl,
        setImageUrl
    };
})();