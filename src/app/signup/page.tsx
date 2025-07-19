'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setSuccess(false)

        if (password !== confirmPassword) {
            setMessage('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) throw error

            setSuccess(true)
            setMessage('Check your email for a confirmation link!')
        } catch (error: unknown) {
            setMessage((error as Error).message || 'An error occurred during signup')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Join Beyblade Tracker
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Create your account to start tracking your collection
                    </p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
                            <p className="text-green-600 dark:text-green-400 font-medium">
                                Account created successfully!
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                Check your email for a confirmation link to complete your registration.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Return to login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                                disabled={loading}
                            />
                        </div>

                        {message && (
                            <div className={`${success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} dark:${success ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'} border rounded-md p-3`}>
                                <p className={`text-sm ${success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {message}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
