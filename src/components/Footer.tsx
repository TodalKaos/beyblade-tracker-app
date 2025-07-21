import React from 'react'

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Made with ❤️ for the Beyblade community
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                            Support the developer:
                        </span>
                        <a
                            href="https://coff.ee/todalkaos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            ☕ Buy Me A Coffee
                        </a>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            © 2025 Beyblade Tracker. Track your collection and tournaments with ease.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
