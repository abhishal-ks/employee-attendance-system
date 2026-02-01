'use client'

import { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import DashboardTopBar from '@/components/DashboardTopBar'

const INDUSTRIES = [
    'Manufacturing',
    'Retail',
    'IT Services',
    'Healthcare',
    'Logistics',
    'Construction',
    'Finance',
    'Other',
]

// 🔹 GPS HELPER
const getGPSLocation = (): Promise<{ lat: number; lng: number }> => {
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
            () => reject(new Error('Permission denied or unable to retrieve location')),
            {
                enableHighAccuracy: false,
                timeout: 10000
            }
        )
    })
}

export default function AddClient(): JSX.Element {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        businessName: '',
        industry: '',
        contactPerson: '',
        phone: '',
        email: '',
        location: '',
    })

    // 🔐 Auth guard
    useEffect(() => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) router.push('/login')
    }, [router])

    const updateField = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const submit = async () => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) return

        if (!form.businessName || !form.industry || !form.phone || !form.location) {
            alert('Please fill all required fields')
            return
        }

        setLoading(true)

        let latitude = ''
        let longitude = ''

        try {
            const loc = await getGPSLocation()
            latitude = String(loc.lat)
            longitude = String(loc.lng)
        } catch {
            alert('Location permission is required to add client')
            setLoading(false)
            return
        }

        try {
            const res = await axios.post(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({
                    type: 'ADD_CLIENT',
                    employeeId,
                    ...form,
                    latitude,
                    longitude
                }),
                { headers: { 'Content-Type': 'text/plain' } }
            )

            alert(res.data.message)

            if (res.data.success) {
                router.push('/dashboard')
            }
        } catch {
            alert('Failed to add client')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <DashboardTopBar />
            
            <div className="flex justify-center py-14 px-4">
                <div className="w-full max-w-xl relative">
                    <button
                        onClick={() => router.back()}
                        className="absolute -top-12 left-0 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <h1 className="text-2xl font-bold text-white">Add Business Client</h1>
                            <p className="text-blue-100 text-sm mt-1">Register a new business lead</p>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Business Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        placeholder="Enter business name"
                                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        value={form.businessName}
                                        onChange={(e) => updateField('businessName', e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Industry <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        value={form.industry}
                                        onChange={(e) => updateField('industry', e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="">Select an industry</option>
                                        {INDUSTRIES.map((i) => (
                                            <option key={i} value={i}>{i}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Contact Person
                                    </label>
                                    <input
                                        placeholder="Full name"
                                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        value={form.contactPerson}
                                        onChange={(e) => updateField('contactPerson', e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        placeholder="Contact number"
                                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        value={form.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        placeholder="Email address"
                                        type="email"
                                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        value={form.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Location / City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        placeholder="City or location"
                                        className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        value={form.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={submit}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Add Client'
                                    )}
                                </button>

                                <button
                                    onClick={() => router.push('/dashboard')}
                                    disabled={loading}
                                    className="px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors duration-300 disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}