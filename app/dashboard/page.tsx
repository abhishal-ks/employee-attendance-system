'use client'

import { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import DashboardTopBar from '@/components/DashboardTopBar'

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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <DashboardTopBar />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Manage your business operations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Attendance */}
                    <button
                        onClick={() => router.push('/attendance')}
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left border border-slate-100 hover:border-green-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="p-3 bg-green-100 rounded-lg w-fit group-hover:bg-green-200 transition-colors duration-300 mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Attendance
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Mark or view today's attendance
                            </p>
                            <div className="mt-6 flex items-center text-green-600 group-hover:text-green-700 font-semibold text-sm">
                                Mark Now
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    {/* Add Client */}
                    <button
                        onClick={() => router.push('/dashboard/add-client')}
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left border border-slate-100 hover:border-purple-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="p-3 bg-purple-100 rounded-lg w-fit group-hover:bg-purple-200 transition-colors duration-300 mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Add Business
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Register a new business lead or client
                            </p>
                            <div className="mt-6 flex items-center text-purple-600 group-hover:text-purple-700 font-semibold text-sm">
                                Get Started
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    {/* My Clients */}
                    <button
                        onClick={() => router.push('/dashboard/clients')}
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left border border-slate-100 hover:border-amber-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="p-3 bg-amber-100 rounded-lg w-fit group-hover:bg-amber-200 transition-colors duration-300 mb-4">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                My Clients
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                View and update your business clients
                            </p>
                            <div className="mt-6 flex items-center text-amber-600 group-hover:text-amber-700 font-semibold text-sm">
                                View All
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
