'use client'

import { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import DashboardTopBar from '@/components/DashboardTopBar'
import { getLocation } from '@/lib/location'

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
    const [interactionType, setInteractionType] = useState('Visit')
    const [interactionNotes, setInteractionNotes] = useState('')

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
    
    // Client interaction with geolocation
    const addInteraction = async (clientId: string) => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) return

        try {
            const position = await getLocation()

            await axios.post(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({
                    type: 'ADD_CLIENT_INTERACTION',
                    employeeId,
                    clientId,
                    interactionType,
                    notes: interactionNotes,
                    latitude: position.lat,
                    longitude: position.lng,
                }),
                { headers: { 'Content-Type': 'text/plain' } }
            )

            alert('Interaction recorded')
            setInteractionNotes('')
        } catch {
            alert('Failed to record interaction')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600">Loading your clients...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <DashboardTopBar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Clients</h1>
                        <p className="text-slate-600 mt-1">Manage and track your business clients</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>

                {clients.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-slate-600 text-lg font-medium">No clients added yet</p>
                        <p className="text-slate-500 text-sm mt-2">Start by adding your first business client</p>
                        <button
                            onClick={() => router.push('/dashboard/add-client')}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
                        >
                            Add Your First Client
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Business</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Industry</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Location</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Image</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Notes</th>
                                        <th className="px-6 py-4 text-left font-semibold text-slate-700">Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {clients.map((c) => (
                                        <tr key={c.clientId} className="hover:bg-slate-50 transition-colors duration-200">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {c.businessName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{c.industry}</td>
                                            <td className="px-6 py-4 text-slate-600">{c.location}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className="border-2 border-slate-200 rounded-lg px-3 py-1 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                    value={c.status}
                                                    onChange={(e) => updateStatus(c.clientId, e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    {c.imageUrl ? (
                                                        <a href={c.imageUrl} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={c.imageUrl}
                                                                alt="Client"
                                                                className="h-16 w-24 object-cover rounded-lg border border-slate-200 hover:opacity-90 transition-opacity"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <div className="h-16 w-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                                                            <span className="text-xs text-slate-400">No image</span>
                                                        </div>
                                                    )}

                                                    <label className="text-xs text-blue-600 cursor-pointer hover:text-blue-700 font-semibold">
                                                        {uploadingId === c.clientId ? (
                                                            <span className="flex items-center gap-1">
                                                                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
                                                                Uploading…
                                                            </span>
                                                        ) : (
                                                            'Upload / Replace'
                                                        )}
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
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    <textarea
                                                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                                        placeholder="Add notes..."
                                                        rows={2}
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
                                                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-semibold"
                                                    >
                                                        Save Notes
                                                    </button>
                                                </div>

                                                <hr className="my-3" />

                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        className="border rounded px-2 py-1 text-xs"
                                                        value={interactionType}
                                                        onChange={(e) => setInteractionType(e.target.value)}
                                                    >
                                                        <option>Visit</option>
                                                        <option>Call</option>
                                                        <option>Meeting</option>
                                                        <option>Follow-up</option>
                                                        <option>Demo</option>
                                                    </select>

                                                    <textarea
                                                        className="w-full border rounded px-2 py-1 text-xs"
                                                        placeholder="Interaction notes (what happened, next steps)"
                                                        value={interactionNotes}
                                                        onChange={(e) => setInteractionNotes(e.target.value)}
                                                    />

                                                    <button
                                                        onClick={() => addInteraction(c.clientId)}
                                                        className="text-xs text-green-600 hover:underline self-start"
                                                    >
                                                        + Add Interaction
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                                                {c.updatedAt}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
