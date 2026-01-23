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
    imageUrl?: string
}

const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()

        reader.onload = e => {
            img.src = e.target?.result as string
        }

        img.onload = () => {
            const canvas = document.createElement('canvas')
            const maxWidth = 1024

            const scale = Math.min(1, maxWidth / img.width)
            canvas.width = img.width * scale
            canvas.height = img.height * scale

            const ctx = canvas.getContext('2d')
            if (!ctx) return reject()

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            const base64 = canvas.toDataURL('image/jpeg', 0.7)
            resolve(base64)
        }

        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export default function MyClients(): JSX.Element {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [uploadingId, setUploadingId] = useState<string | null>(null)

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
                // {
                //     params: {
                //         type: 'GET_MY_CLIENTS',
                //         employeeId,
                //     }
                // }
                JSON.stringify({
                    type: 'GET_MY_CLIENTS',
                    employeeId,
                }),
                // { headers: { 'Content-Type': 'text/plain' } }
            )
            .then((res) => {
                if (res.data.success) {
                    setClients(res.data.clients || [])
                }
            })
            .finally(() => setLoading(false))
    }, [router])

    const uploadClientImage = async (clientId: string, file?: File) => {
        if (!file) return

        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) return

        try {
            setUploadingId(clientId)

            const base64 = await resizeImage(file)

            const res = await fetch(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        type: 'UPLOAD_CLIENT_IMAGE',
                        clientId,
                        employeeId,
                        base64,
                    }),
                }
            )

            const data = await res.json()

            if (data.success) {
                // re-fetch clients OR optimistically update image URL if returned
                // simplest: reload list
                const r = await axios.post(
                    process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                    JSON.stringify({ type: 'GET_MY_CLIENTS', employeeId })
                )
                if (r.data.success) setClients(r.data.clients || [])
            }
        } finally {
            setUploadingId(null)
        }
    }


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
                                    <th className="px-4 py-3 text-left">Image</th>
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
                                        {/* <td className="px-4 py-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={(e) =>
                                                    uploadClientImage(c.clientId, e.target.files?.[0])
                                                }
                                            />
                                        </td> */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-2">
                                                {c.imageUrl ? (
                                                    <a href={c.imageUrl} target="_blank" rel="noopener noreferrer">
                                                        <img
                                                            src={c.imageUrl}
                                                            alt="Client"
                                                            className="h-16 w-24 object-cover rounded border hover:opacity-90"
                                                        />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No image</span>
                                                )}

                                                <label className="text-xs text-blue-600 cursor-pointer hover:underline">
                                                    {uploadingId === c.clientId ? 'Uploading…' : 'Upload / Replace'}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        capture="environment"
                                                        className="hidden"
                                                        disabled={uploadingId === c.clientId}
                                                        onChange={(e) =>
                                                            uploadClientImage(c.clientId, e.target.files?.[0])
                                                        }
                                                    />
                                                </label>
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
