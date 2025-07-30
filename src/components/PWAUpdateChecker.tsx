'use client';

import { useEffect } from 'react';

export default function PWAUpdateChecker() {
    useEffect(() => {
        const checkForUpdates = async () => {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    // Force check for updates
                    registration.update();
                }
            }
        };

        // Force check for service worker updates every 30 seconds when app is active
        const updateCheckInterval = setInterval(checkForUpdates, 30000); // 30 seconds

        // Check for updates when app becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkForUpdates();
            }
        };

        // Check for updates on focus
        const handleFocus = () => {
            checkForUpdates();
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        // Initial check
        checkForUpdates();

        return () => {
            clearInterval(updateCheckInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    return null; // This component doesn't render anything
}
