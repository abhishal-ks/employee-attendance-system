'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Attendance {
    date: string
    employeeId: string
    employeeName: string
    checkIn: string
    status: string
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

    if (loading) {
        return <div className="p-6 text-gray-500">Loading attendance...</div>
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-semibold">Attendance Records</h1>
                    <button
                        onClick={() => router.push('/admin')}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Admin
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="border rounded px-3 py-1 text-sm"
                    />
                </div>

                <div className="bg-white rounded shadow overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Employee</th>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Check-in</th>
                                <th className="px-4 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => (
                                <tr key={i} className="border-t">
                                    <td className="px-4 py-3">{r.date}</td>
                                    <td className="px-4 py-3">{r.employeeName}</td>
                                    <td className="px-4 py-3">{r.employeeId}</td>
                                    <td className="px-4 py-3">{r.checkIn}</td>
                                    <td className="px-4 py-3">{r.status}</td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}