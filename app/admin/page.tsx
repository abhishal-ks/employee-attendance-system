'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminHome() {
    const router = useRouter()

    // 🔐 Admin-only guard
    useEffect(() => {
        const role = localStorage.getItem('role')
        if (role !== 'admin') {
            router.replace('/dashboard')
        }
    }, [router])

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-xl font-semibold mb-6">Admin Dashboard</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => router.push('/admin/attendance')}
                        className="bg-white rounded shadow p-6 text-left hover:bg-gray-50"
                    >
                        <h2 className="font-medium">Attendance</h2>
                        <p className="text-sm text-gray-500">
                            View and track employee attendance
                        </p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/clients')}
                        className="bg-white rounded shadow p-6 text-left hover:bg-gray-50"
                    >
                        <h2 className="font-medium">Clients</h2>
                        <p className="text-sm text-gray-500">
                            View clients, status, images & map
                        </p>
                    </button>
                </div>
            </div>
        </div>
    )
}