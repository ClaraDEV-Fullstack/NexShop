import { useState, useLayoutEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

/**
 * GoogleLogin renders a fixed-width iframe. This wrapper measures its container
 * and passes a responsive width so the button never overflows on mobile.
 */
const ResponsiveGoogleLogin = (props) => {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(null);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const updateWidth = () => {
            const available = el.getBoundingClientRect().width;
            setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.floor(available))));
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(el);
        window.addEventListener('resize', updateWidth);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full max-w-[400px] mx-auto min-h-[44px]">
            {width !== null && <GoogleLogin {...props} width={width} />}
        </div>
    );
};

export default ResponsiveGoogleLogin;
