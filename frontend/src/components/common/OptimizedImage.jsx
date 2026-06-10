import { useState } from 'react';
import { PLACEHOLDER_IMAGE } from '../../utils/helpers';

/**
 * Optimised product image.
 * - priority=true  → eager load + fetchpriority="high" (use for above-fold images)
 * - priority=false → native browser lazy loading (default)
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

    const imgSrc = src || PLACEHOLDER_IMAGE;
    const displaySrc = hasError ? PLACEHOLDER_IMAGE : imgSrc;

    return (
        <div className={`relative overflow-hidden ${placeholderClassName}`}>
            {/* Skeleton — shown until image loads */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
            )}

            <img
                src={displaySrc}
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
