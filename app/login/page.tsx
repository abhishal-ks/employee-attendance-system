'use client';

import { JSX, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image';

interface LoginResponse {
    success: boolean
    message: string
    role: 'admin' | 'employee'
}

export default function Login(): JSX.Element {
    const [employeeId, setEmployeeId] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const login = async (): Promise<void> => {
        if (!employeeId) {
            alert('Enter Employee ID')
            return
        }

        setLoading(true);

        try {
            const res = await axios.post<LoginResponse>(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({
                    type: 'LOGIN',
                    employeeId,
                }),
            );

            if (!res.data.success) {
                alert(res.data.message)
                return
            }

            // ✅ Persist session
            localStorage.setItem('employeeId', employeeId);

            localStorage.setItem('role', res.data.role)

            if (res.data.role === 'admin') {
                localStorage.setItem('isAdmin', 'true');
                router.push('/admin');
            } else {
                localStorage.removeItem('isAdmin');
                router.push('/dashboard');
            }
        } catch {
            alert('Login failed')
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-center">
                        <div className="flex justify-center relative w-40 h-28 mx-auto mb-6">
                            <Image
                                src="/SVLogo.png"
                                alt="Smart Vyapaar Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            <span>Smart</span>&nbsp;<span>Vyapaar</span>
                        </h1>
                        <p className="text-blue-100 text-sm mt-2">Employee Management System</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <p className='text-center text-slate-600 mb-6 text-sm'>
                            Sign in with your Employee ID
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your Employee ID"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                onClick={login}
                                disabled={loading || !employeeId.trim()}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>

                        <p className="text-center text-slate-500 text-xs mt-6">
                            Secure login • Your data is protected
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
