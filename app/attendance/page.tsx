'use client'

import axios from 'axios'
import { JSX } from 'react'

// type AttendanceStatus = 'Present' | 'Late' | 'Absent'

interface AttendancePayload {
    type: 'Attendance'
    date: string
    employeeId: string
    name: string
    checkIn: string
    status: 'Present'
}

export default function Attendance(): JSX.Element {

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

        await axios.post(
            process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
            payload
        )

        alert('Attendance marked successfully')
    }

    return (
        <div>
            <h1>Mark Attendance</h1>
            <button onClick={markAttendance}>
                Mark Attendance
            </button>
        </div>
    )
}
