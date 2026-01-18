'use client'

import { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Client {
    clientId: string
    businessName: string
    industry: string
    location: string
    status: string
    updatedAt: string
    description?: string
}


export default function MyClients(): JSX.Element {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)

    const STATUS_OPTIONS = [
        'Lead Generated',
        'Contacted',
        'Meeting Scheduled',
        'Proposal Sent',
        'Negotiation',
        'Converted',
        'Follow-up Required',
        'Not Interested',
    ]

    const updateStatus = async (
        clientId: string,
        status: string,
        description?: string
    ) => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) return

        try {
            const res = await axios.post(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({
                    type: 'UPDATE_CLIENT_STATUS',
                    clientId,
                    employeeId,
                    status,
                    description
                }),
                { headers: { 'Content-Type': 'text/plain' } }
            )

            alert(res.data.message)

            if (res.data.success) {
                setClients((prev) =>
                    prev.map((c) =>
                        c.clientId === clientId
                            ? { ...c, status, updatedAt: new Date().toLocaleString() }
                            : c
                    )
                )
            }
        } catch {
            alert('Failed to update status')
        }
    }

    useEffect(() => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) {
            router.push('/login')
            return
        }

        axios
            .post(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({
                    type: 'GET_MY_CLIENTS',
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
                Loading clients...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold">My Clients</h1>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {clients.length === 0 ? (
                    <div className="bg-white p-6 rounded shadow text-gray-600">
                        No clients added yet.
                    </div>
                ) : (
                    <div className="bg-white rounded shadow overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left">Business</th>
                                    <th className="px-4 py-3 text-left">Industry</th>
                                    <th className="px-4 py-3 text-left">Location</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Description / Notes</th>
                                    <th className="px-4 py-3 text-left">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((c) => (
                                    <tr key={c.clientId} className="border-t">
                                        <td className="px-4 py-3 font-medium">
                                            {c.businessName}
                                        </td>
                                        <td className="px-4 py-3">{c.industry}</td>
                                        <td className="px-4 py-3">{c.location}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 items-center">
                                                <select
                                                    className="border rounded px-2 py-1 text-xs"
                                                    value={c.status}
                                                    onChange={(e) => updateStatus(c.clientId, e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" colSpan={5}>
                                            <textarea
                                                className="w-full border rounded px-2 py-1 text-xs"
                                                placeholder="Client description / notes"
                                                value={c.description || ''}
                                                onChange={(e) =>
                                                    setClients(prev =>
                                                        prev.map(p =>
                                                            p.clientId === c.clientId
                                                                ? { ...p, description: e.target.value }
                                                                : p
                                                        )
                                                    )
                                                }
                                            />
                                            <button
                                                onClick={() =>
                                                    updateStatus(c.clientId, c.status, c.description || '')
                                                }
                                                className="mt-1 text-xs text-blue-600 hover:underline"
                                            >
                                                Save description
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {c.updatedAt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
