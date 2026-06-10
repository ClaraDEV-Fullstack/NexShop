// src/utils/helpers.js

// Backend URLs for different environments
const getBackendUrl = () => {
    // Check if we're in production
    if (import.meta.env.PROD) {
        return 'https://nexshop.onrender.com';
    }
    // Local development
    return 'http://127.0.0.1:8000';
};

export const BACKEND_URL = getBackendUrl();

// Default placeholder
export const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect fill="#f3f4f6" width="400" height="400"/>
  <g transform="translate(150, 140)">
    <rect fill="#d1d5db" width="100" height="70" rx="8"/>
    <circle fill="#9ca3af" cx="30" cy="25" r="12"/>
    <path fill="#9ca3af" d="M10,70 L40,40 L70,70 Z"/>
    <path fill="#b0b5bc" d="M50,70 L75,50 L100,70 Z"/>
  </g>
  <text x="200" y="260" font-family="system-ui,sans-serif" font-size="14" font-weight="500" fill="#9ca3af" text-anchor="middle">No Image</text>
</svg>
`)}`;

// Robust image URL getter - handles all formats
export const getImageUrl = (imageData) => {
    // Handle null/undefined/empty
    if (!imageData) {
        return PLACEHOLDER_IMAGE;
    }

    // If it's a string
    if (typeof imageData === 'string') {
        // Empty string
        if (imageData.trim() === '') {
            return PLACEHOLDER_IMAGE;
        }
        // Already a full URL
        if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
            return imageData;
        }
        // Data URL (SVG, base64)
        if (imageData.startsWith('data:')) {
            return imageData;
        }
        // Relative path - prepend backend URL
        const cleanPath = imageData.startsWith('/') ? imageData : `/${imageData}`;
        return `${BACKEND_URL}${cleanPath}`;
    }

    // If it's an object
    if (typeof imageData === 'object') {
        // Try image_url first (from updated serializer)
        if (imageData.image_url) {
            return getImageUrl(imageData.image_url);
        }

        // Try image field
        if (imageData.image) {
            return getImageUrl(imageData.image);
        }

        // Try url field
        if (imageData.url) {
            return getImageUrl(imageData.url);
        }

        // Try src field
        if (imageData.src) {
            return getImageUrl(imageData.src);
        }
    }

    // Fallback
    return PLACEHOLDER_IMAGE;
};

// Format price in XAF (FCFA — Franc CFA, Cameroon)
export const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 FCFA';
    const amount = Math.round(parseFloat(price));
    return amount.toLocaleString('en-US') + ' FCFA';
};

// Format date
export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
