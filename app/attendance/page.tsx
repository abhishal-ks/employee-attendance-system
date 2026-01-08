'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { JSX, useEffect } from 'react'

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

    useEffect(() => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) {
            router.push('/login')
        }
    }, [router])

    const markAttendance = async (): Promise<void> => {
        const employeeId = localStorage.getItem('employeeId')

        if (!employeeId) {
            alert('Not logged in')
            return
        }

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
        } catch (error) {
            alert('Something went wrong')
        }
    }

    return (
        <div
            className='w-fit mx-auto my-0.5 text-center'
        >
            <h1
                className='text-2xl font-bold mb-4'
            >Mark Attendance</h1>
            <button
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer'
                onClick={markAttendance}
            >
                Mark Attendance
            </button>
        </div>
    )
}
