'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import AdminTopBar from '@/components/AdminTopBar'

interface Attendance {
    date: string
    employeeId: string
    employeeName: string
    checkIn: string
    status: string
    latitude?: string
    longitude?: string
    deviceId?: string
}

export default function AdminAttendance() {
    const router = useRouter()
    const [records, setRecords] = useState<Attendance[]>([])
    const [loading, setLoading] = useState(true)
    const [filterDate, setFilterDate] = useState('')

    useEffect(() => {
        const employeeId = localStorage.getItem('employeeId')
        const role = localStorage.getItem('role')

        if (!employeeId || role !== 'admin') {
            router.replace('/dashboard')
            return
        }

        axios.post(
            process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
            JSON.stringify({
                type: 'GET_ALL_ATTENDANCE_ADMIN',
                employeeId,
            }),
            { headers: { 'Content-Type': 'text/plain' } }
        )
            .then(res => {
                if (res.data.success) {
                    setRecords(res.data.records || [])
                }
            })
            .finally(() => setLoading(false))
    }, [router])

    const filtered = filterDate
        ? records.filter(r => r.date === filterDate)
        : records

    // Sorted attendance records by date (newest first)
    const sortedRecords = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
                <AdminTopBar />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-slate-600">Loading attendance records...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
            <AdminTopBar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Attendance Records</h1>
                            <p className="text-slate-600 mt-1">Track and manage employee attendance</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-300 text-sm font-medium"
                        >
                            ← Back to Admin
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Date</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="border-2 border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-linear-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Date</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Employee</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Employee ID</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Check-in Time</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                                    <th className="px-4 py-3 text-left">Location</th>
                                    <th className="px-4 py-3 text-left">Device</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {sortedRecords.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors duration-200">
                                        <td className="px-6 py-4 text-slate-900">{r.date}</td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{r.employeeName}</td>
                                        <td className="px-6 py-4 text-slate-600">{r.employeeId}</td>
                                        <td className="px-6 py-4 text-slate-600">{r.checkIn}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                            ${r.status === 'Present' ? 'bg-green-100 text-green-800' : r.status === 'Casual Leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                                            >
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {r.latitude && r.longitude ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 text-xs hover:underline"
                                                >
                                                    View on Map
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {r.deviceId && (
                                                <span className="text-xs text-gray-400">{r.deviceId}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-lg font-medium">No attendance records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
