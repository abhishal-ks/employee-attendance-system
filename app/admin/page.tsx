'use client'

import { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Client {
    clientId: string
    employeeId: string
    businessName: string
    industry: string
    location: string
    status: string
    updatedAt: string
}

export default function AdminPanel(): JSX.Element {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const employeeId = localStorage.getItem('employeeId')
        const isAdmin = localStorage.getItem('isAdmin')

        if (!employeeId || isAdmin !== 'true') {
            router.push('/login')
            return
        }

        axios
            .post(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({
                    type: 'GET_ALL_CLIENTS_ADMIN',
                    employeeId,
                }),
                { headers: { 'Content-Type': 'text/plain' } }
            )
            .then((res) => {
                if (res.data.success) {
                    setClients(res.data.clients || [])
                }
            })
            .finally(() => setLoading(false))
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading admin panel...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold">Admin Panel</h1>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back
                    </button>
                </div>

                <div className="bg-white rounded shadow overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Business</th>
                                <th className="px-4 py-3 text-left">Employee</th>
                                <th className="px-4 py-3 text-left">Industry</th>
                                <th className="px-4 py-3 text-left">Location</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((c) => (
                                <tr key={c.clientId} className="border-t">
                                    <td className="px-4 py-3 font-medium">
                                        {c.businessName}
                                    </td>
                                    <td className="px-4 py-3">{c.employeeId}</td>
                                    <td className="px-4 py-3">{c.industry}</td>
                                    <td className="px-4 py-3">{c.location}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded bg-gray-200 text-xs">
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {c.updatedAt}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
