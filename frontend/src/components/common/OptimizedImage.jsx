import { useState } from 'react';

/**
 * Optimised product image.
 * - priority=true  → eager load + fetchpriority="high" (use for above-fold images)
 * - priority=false → native browser lazy loading (default)
 *
 * Cloudinary-specific URL transforms have been removed — images are on Supabase CDN.
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    placeholderClassName = '',
    priority = false,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const imgSrc = src || '/placeholder-product.jpg';

    return (
        <div className={`relative overflow-hidden ${placeholderClassName}`}>
            {/* Skeleton — shown until image loads */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
            )}

            <img
                src={hasError ? '/placeholder-product.jpg' : imgSrc}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchpriority={priority ? 'high' : 'auto'}
                onLoad={() => setIsLoaded(true)}
                onError={() => { setHasError(true); setIsLoaded(true); }}
                className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
};

export default OptimizedImage;
