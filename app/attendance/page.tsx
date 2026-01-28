'use client'

import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { JSX, useEffect, useState } from 'react'
import DashboardTopBar from '@/components/DashboardTopBar'

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
        <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
            <DashboardTopBar />

            <div className="flex flex-col items-center justify-center p-4">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-300 text-sm font-medium flex items-center gap-2 self-start"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Main Card */}
                <div className="w-full max-w-md mt-8">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                    {/* Header */}
                    <div className="bg-linear-to-r from-green-600 to-emerald-600 px-8 py-12 text-center">
                        <div className="flex justify-center relative w-40 h-28 mx-auto mb-6">
                            <Image
                                src="/s-vyapaar.jpeg"
                                alt="Smart Vyapaar Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Attendance
                        </h1>
                        <p className="text-green-100 text-sm">Mark your daily presence</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-100">
                            <p className='text-slate-600 text-sm mb-2'>Marking attendance for</p>
                            <p className="text-2xl font-bold text-green-700">
                                {new Date().toDateString()}
                            </p>
                        </div>

                        {marked && (
                            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-green-700 font-semibold">Attendance marked successfully</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={markAttendance}
                            disabled={loading || marked}
                            className={`w-full text-white font-semibold py-3 rounded-lg transition-all duration-300 transform ${
                                marked
                                    ? 'bg-green-600 cursor-default'
                                    : 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 active:scale-95'
                            } disabled:opacity-60`}
                        >
                            {marked
                                ? '✓ Attendance Marked'
                                : loading
                                    ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            Getting location...
                                        </span>
                                    )
                                    : 'Mark Attendance'}
                        </button>

                        <p className="text-slate-500 text-xs mt-6">
                            Location access required for attendance marking
                        </p>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
