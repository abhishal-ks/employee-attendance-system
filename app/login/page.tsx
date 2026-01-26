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
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 rounded-lg shadow-md w-full max-w-sm">
                <div className="flex justify-center relative w-44 h-32 mx-auto mb-6">
                    <Image
                        src="/s-vyapaar.jpeg"
                        alt="Smart Vyapaar Logo"
                        fill
                        className="mx-auto mb-4"
                    />
                </div>
                <h1 className="text-4xl font-semibold text-center mb-9">
                    <span className='text-[rgba(32,70,121,1)]'>Smart</span>&nbsp;
                    <span className='text-[rgba(235,50,58,1)]'>Vyapaar</span> Attendance Login
                </h1>

                <p className='text-center mb-6'>
                    Login to mark your Smart Vyapaar Attendance
                </p>

                <input
                    type="text"
                    placeholder="Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={login}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </div>
    )
}
