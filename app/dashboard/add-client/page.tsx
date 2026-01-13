'use client'

import { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

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

        try {
            const res = await axios.post(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({
                    type: 'ADD_CLIENT',
                    employeeId,
                    ...form,
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
        <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-lg">
                <h1 className="text-xl font-semibold mb-6">
                    Add Business Client
                </h1>

                <div className="space-y-4">
                    <input
                        placeholder="Business Name *"
                        className="w-full border rounded px-3 py-2"
                        value={form.businessName}
                        onChange={(e) => updateField('businessName', e.target.value)}
                    />

                    <select
                        className="w-full border rounded px-3 py-2"
                        value={form.industry}
                        onChange={(e) => updateField('industry', e.target.value)}
                    >
                        <option value="">Select Industry *</option>
                        {INDUSTRIES.map((i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>

                    <input
                        placeholder="Contact Person"
                        className="w-full border rounded px-3 py-2"
                        value={form.contactPerson}
                        onChange={(e) => updateField('contactPerson', e.target.value)}
                    />

                    <input
                        placeholder="Phone *"
                        className="w-full border rounded px-3 py-2"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                    />

                    <input
                        placeholder="Email"
                        className="w-full border rounded px-3 py-2"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                    />

                    <input
                        placeholder="Location / City *"
                        className="w-full border rounded px-3 py-2"
                        value={form.location}
                        onChange={(e) => updateField('location', e.target.value)}
                    />
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
                    >
                        {loading ? 'Saving...' : 'Add Client'}
                    </button>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-600 px-4 py-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
