import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

interface NavigationProps {
    currentPage: string
}

export default function Navigation({ currentPage }: NavigationProps) {
    const { user, signOut } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Brand */}
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <span className="text-2xl">⚡</span>
                        <span className="hidden sm:inline">Beyblade Tracker</span>
                        <span className="sm:hidden">Beyblade</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <span className="text-lg">☰</span>
                    </button>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'home'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            🏠 Home
                        </Link>
                        <Link
                            href="/collection"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'collection'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            📦 Collection
                        </Link>
                        <Link
                            href="/combos"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'combos'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            ⚡ Combos
                        </Link>
                        <Link
                            href="/testing"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'testing'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            ⚔️ Testing
                        </Link>
                        <Link
                            href="/tournaments"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'tournaments'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            🏆 Tournaments
                        </Link>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {user?.email}
                            </span>
                            <button
                                onClick={signOut}
                                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Sign out"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === 'home'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <span className="text-lg mr-2">🏠</span>
                                Home
                            </Link>
                            <Link
                                href="/collection"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === 'collection'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <span className="text-lg mr-2">📦</span>
                                Collection
                            </Link>
                            <Link
                                href="/combos"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === 'combos'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <span className="text-lg mr-2">⚡</span>
                                Combos
                            </Link>
                            <Link
                                href="/testing"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === 'testing'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <span className="text-lg mr-2">⚔️</span>
                                Testing
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-2 mb-4">
                            <Link
                                href="/tournaments"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === 'tournaments'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <span className="text-lg mr-2">🏆</span>
                                Tournaments
                            </Link>
                        </div>

                        {/* Mobile User Menu */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                    {user?.email}
                                </span>
                                <button
                                    onClick={() => {
                                        signOut()
                                        setMobileMenuOpen(false)
                                    }}
                                    className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-900/20 rounded-lg"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
