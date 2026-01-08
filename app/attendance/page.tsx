'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { JSX, useEffect, useState } from 'react'

// type AttendanceStatus = 'Present' | 'Late' | 'Absent'

interface AttendancePayload {
    type: 'Attendance'
    date: string
    employeeId: string
    name: string
    checkIn: string
    status: 'Present'
}

interface ApiResponse {
    success: boolean
    message: string
}

export default function Attendance(): JSX.Element {
    const router = useRouter()

    const [loading, setLoading] = useState(false);
    const [marked, setMarked] = useState(false);

    useEffect(() => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) {
            router.push('/login')
        }
    }, [router])

    const markAttendance = async (): Promise<void> => {
        const employeeId = localStorage.getItem('employeeId')

        if (!employeeId) return

        setLoading(true);

        const now = new Date()

        const payload: AttendancePayload = {
            type: 'Attendance',
            date: now.toISOString().split('T')[0],
            employeeId,
            name: employeeId,
            checkIn: now.toLocaleTimeString(),
            status: 'Present',
        }

        try {
            const res = await axios.post<ApiResponse>(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify(payload),
                {
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                }
            );

            alert(res.data.message)

            if (res.data.success) setMarked(true);

        } catch (error) {
            alert('Failed to mark attendance')
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                <h1 className="text-4xl font-semibold mb-9">
                    Smart Vyapaar Attendance
                </h1>

                <p className='text-gray-300 mb-2'>Mark your attendance for </p>
                <p className="mb-6 text-lg">
                    {new Date().toDateString()}
                </p>

                <button
                    onClick={markAttendance}
                    disabled={loading || marked}
                    className={`w-full py-3 rounded transition
                        ${marked
                            ? 'bg-green-600'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }
                        disabled:opacity-60`}
                >
                    {marked
                        ? 'Attendance Marked'
                        : loading
                            ? 'Marking...'
                            : 'Mark Attendance'}
                </button>
            </div>
        </div>
    )
}
