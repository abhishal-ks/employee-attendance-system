'use client'

import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { JSX, useEffect, useState } from 'react'

// type AttendanceStatus = 'Present' | 'Late' | 'Absent'

interface AttendancePayload {
    type: 'Attendance'
    date: string
    employeeId: string
    checkIn: string
    status: 'Present'
    latitude: number
    longitude: number
}

interface ApiResponse {
    success: boolean
    message: string
}

interface WhoAmIResponse {
    success: boolean;
    employeeId?: string;
    name?: string;
    message?: string;
}

export default function Attendance(): JSX.Element {
    const router = useRouter()

    const [employeeId, setEmployeeId] = useState<string | null>(null)
    const [name, setName] = useState<string | null>(null)

    const [loading, setLoading] = useState(false);
    const [marked, setMarked] = useState(false);

    // 🔐 Auth + fetch user info
    useEffect(() => {
        const id = localStorage.getItem('employeeId')
        if (!id) {
            router.push('/login')
            return
        }

        setEmployeeId(id)

        axios.post<WhoAmIResponse>(
            process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
            JSON.stringify({ type: 'WHOAMI', employeeId: id }),
            { headers: { 'Content-Type': 'text/plain' } }
        ).then(res => {
            if (res.data.success) setName(res.data.name || '')
        });

    }, [router])

    // 🚪 Logout
    const logout = () => {
        localStorage.removeItem('employeeId')
        router.push('/login')
    }

    const getLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (error) => {
                    reject(error)
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000
                }
            )
        })
    }

    const markAttendance = async (): Promise<void> => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) return

        setLoading(true);

        try {
            // 📍 Get location
            const location = await getLocation()

            const now = new Date()

            const payload: AttendancePayload = {
                type: 'Attendance',
                date: now.toISOString().split('T')[0],
                employeeId,
                checkIn: now.toLocaleTimeString(),
                status: 'Present',
                latitude: location.lat,
                longitude: location.lng
            }

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

        } catch (err: any) {
            alert('Location permission is required to mark attendance')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 rounded-lg shadow-md w-full max-w-sm text-center">

                <div className="absolute top-4 right-4 text-sm text-gray-600 flex items-center gap-3">
                    <span>
                        Logged in as <strong>{employeeId}</strong>
                        {name && ` (${name})`}
                    </span>

                    <button
                        onClick={logout}
                        className="text-red-600 hover:underline"
                    >
                        Logout
                    </button>
                </div>

                <div className="flex justify-center relative w-44 h-32 mx-auto mb-6">
                    <Image
                        src="/s-vyapaar.jpeg"
                        alt="Smart Vyapaar Logo"
                        fill
                        className="mx-auto mb-4"
                    />
                </div>
                <h1 className="text-4xl font-semibold mb-9">
                    <span className='text-[rgba(32,70,121,1)]'>Smart</span>&nbsp;
                    <span className='text-[rgba(235,50,58,1)]'>Vyapaar</span> Attendance
                </h1>

                <p className='text-gray-800 mb-2'>Mark your attendance for </p>
                <p className="mb-6 text-lg">
                    {new Date().toDateString()}
                </p>

                <button
                    onClick={markAttendance}
                    disabled={loading || marked}
                    className={`w-full text-white py-3 rounded transition
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
