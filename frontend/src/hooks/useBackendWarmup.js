import { useEffect, useState } from 'react';
import { API_URL } from '../config';

const isRemoteApi = () => {
    const url = (API_URL || '').toLowerCase();
    return url.includes('onrender.com') || url.includes('railway.app') || url.includes('fly.dev');
};

export function useBackendWarmup() {
    const [status, setStatus] = useState(isRemoteApi() ? 'warming' : 'ready');

    useEffect(() => {
        if (!isRemoteApi()) return undefined;

        let cancelled = false;
        const controller = new AbortController();

        const ping = async (attempt = 0) => {
            if (cancelled) return;

            try {
                const response = await fetch(`${API_URL}/health/`, {
                    signal: controller.signal,
                    cache: 'no-store',
                });

                if (response.ok) {
                    if (!cancelled) setStatus('ready');
                    return;
                }
            } catch {
                // Render free tier cold start — retry until the service is up.
            }

            if (cancelled) return;

            if (attempt < 15) {
                const delay = Math.min(1500 + attempt * 500, 6000);
                window.setTimeout(() => ping(attempt + 1), delay);
                return;
            }

            setStatus('ready');
        };

        ping();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    return status;
}
