'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export default function PWAManager() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Check if app is already installed
        const checkIfInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isIOSInstalled = (window.navigator as { standalone?: boolean }).standalone === true;
            setIsInstalled(isStandalone || isIOSInstalled);
        };

        // Handle install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstallButton(true);
        };

        // Handle app installed
        const handleAppInstalled = () => {
            console.log('PWA was installed');
            setShowInstallButton(false);
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        // Handle online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Register event listeners
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        checkIfInstalled();
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setShowInstallButton(false);
    };

    return (
        <>
            {/* Install Button */}
            {showInstallButton && !isInstalled && (
                <div className="fixed bottom-4 right-4 z-50">
                    <button
                        onClick={handleInstallClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8l-8-8-8 8"
                            />
                        </svg>
                        Install App
                    </button>
                </div>
            )}

            {/* Offline Indicator */}
            {!isOnline && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium z-50">
                    <div className="flex items-center justify-center gap-2">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        You&apos;re offline - Some features may be limited
                    </div>
                </div>
            )}

            {/* Update Available Notification */}
            <PWAUpdateNotifier />
        </>
    );
}

function PWAUpdateNotifier() {
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setWaitingWorker(newWorker);
                                setShowUpdatePrompt(true);
                            }
                        });
                    }
                });
            });

            // Listen for messages from the service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SW_UPDATED') {
                    setShowUpdatePrompt(true);
                }
            });
        }
    }, []);

    const handleUpdate = () => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            waitingWorker.addEventListener('statechange', () => {
                if (waitingWorker.state === 'activated') {
                    window.location.reload();
                }
            });
        }
        setShowUpdatePrompt(false);
    };

    const handleDismiss = () => {
        setShowUpdatePrompt(false);
    };

    if (!showUpdatePrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Update Available
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        A new version of Beyblade Tracker is available with bug fixes and improvements.
                    </p>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleUpdate}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                            Update
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                            Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
