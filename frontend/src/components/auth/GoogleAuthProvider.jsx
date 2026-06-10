import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Scope Google Sign-In to auth pages only — avoids COOP/postMessage warnings on checkout/payment.
 */
const GoogleAuthProvider = ({ children }) => {
    if (!GOOGLE_CLIENT_ID) {
        return children;
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
        </GoogleOAuthProvider>
    );
};

export default GoogleAuthProvider;
