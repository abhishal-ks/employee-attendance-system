'use client'

import { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface WhoAmIResponse {
    success: boolean
    employeeId?: string
    name?: string
    message?: string
}

export default function Dashboard(): JSX.Element {
    const router = useRouter()
    const [employeeId, setEmployeeId] = useState<string | null>(null)
    const [name, setName] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // 🔐 Auth + fetch employee info
    useEffect(() => {
        const id = localStorage.getItem('employeeId')

        if (!id) {
            router.push('/login')
            return
        }

        axios
            .post<WhoAmIResponse>(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({ type: 'WHOAMI', employeeId: id }),
                { headers: { 'Content-Type': 'text/plain' } }
            )
            .then((res) => {
                if (!res.data.success) {
                    localStorage.removeItem('employeeId')
                    router.push('/login')
                    return
                }

                setEmployeeId(res.data.employeeId || id)
                setName(res.data.name || '')
            })
            .finally(() => setLoading(false))
    }, [router])

    // 🚪 Logout
    const logout = () => {
        localStorage.removeItem('employeeId')
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading dashboard...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Bar */}
            <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-semibold">Employee Dashboard</h1>
                    <p className="text-sm text-gray-600">
                        Logged in as <strong>{employeeId}</strong>
                        {name && ` (${name})`}
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="text-red-600 text-sm hover:underline"
                >
                    Logout
                </button>
            </div>

            {/* Main Actions */}
            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Add Client */}
                    <button
                        onClick={() => router.push('/dashboard/add-client')}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md text-left cursor-pointer"
                    >
                        <h2 className="text-lg font-semibold mb-1">
                            ➕ Add Business Client
                        </h2>
                        <p className="text-sm text-gray-600">
                            Register a new business lead or client
                        </p>
                    </button>

                    {/* My Clients */}
                    <button
                        onClick={() => router.push('/dashboard/clients')}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md text-left cursor-pointer"
                    >
                        <h2 className="text-lg font-semibold mb-1">
                            📋 My Clients
                        </h2>
                        <p className="text-sm text-gray-600">
                            View and update your business clients
                        </p>
                    </button>

                    {/* Attendance */}
                    <button
                        onClick={() => router.push('/attendance')}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md text-left cursor-pointer"
                    >
                        <h2 className="text-lg font-semibold mb-1">
                            🕒 Attendance
                        </h2>
                        <p className="text-sm text-gray-600">
                            Mark or view today’s attendance
                        </p>
                    </button>
                </div>
            </div>
        </div>
    )
}
