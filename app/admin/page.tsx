'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminTopBar from '@/components/AdminTopBar'

export default function AdminHome() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    // 🔐 Admin-only guard
    useEffect(() => {
        const role = localStorage.getItem('role')
        if (role !== 'admin') {
            router.replace('/dashboard')
        } else {
            setLoading(false)
        }
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <AdminTopBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-slate-600">Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <AdminTopBar />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                    <p className="text-lg text-slate-600">Manage your business operations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button
                        onClick={() => router.push('/admin/attendance')}
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left border border-slate-100 hover:border-blue-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Management</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Attendance</h2>
                            <p className="text-slate-600 leading-relaxed">
                                View and track employee attendance records with detailed analytics and reporting
                            </p>
                            <div className="mt-6 flex items-center text-blue-600 group-hover:text-blue-700 font-semibold">
                                Go to Attendance
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/admin/clients')}
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left border border-slate-100 hover:border-emerald-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors duration-300">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM16 12a4 4 0 11-8 0 4 4 0 018 0zM21 12a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Contacts</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Clients</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Manage clients, view their status, images, locations and detailed information
                            </p>
                            <div className="mt-6 flex items-center text-emerald-600 group-hover:text-emerald-700 font-semibold">
                                Go to Clients
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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