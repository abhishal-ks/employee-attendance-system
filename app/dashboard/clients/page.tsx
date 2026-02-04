'use client'

import { Fragment, JSX, useEffect, useState } from 'react'
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
    const [openClientId, setOpenClientId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    // const [expandedClient, setExpandedClient] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)

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

    // Filtering clients based on search query
    const filteredClients = clients.filter(c => {
        const q = search.toLowerCase()

        return (
            c.businessName.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q)
        )
    })

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

                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search by business, industry or location…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                {/* 📱 MOBILE VIEW (cards) */}
                <div className="block md:hidden space-y-4">
                    {filteredClients.length === 0 && (
                        <div className="bg-white rounded-xl border p-6 text-center text-slate-500">
                            No matching clients found
                        </div>
                    )}

                    {filteredClients.map((c) => {
                        const isOpen = expandedId === c.clientId

                        return (
                            <div
                                key={c.clientId}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                            >
                                {/* ===== Card Header (always visible) ===== */}
                                <button
                                    onClick={() =>
                                        setExpandedId(isOpen ? null : c.clientId)
                                    }
                                    className="w-full flex justify-between items-center px-4 py-3 text-left"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {c.businessName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {c.location}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                            {c.status}
                                        </span>

                                        <span className="text-lg">
                                            {isOpen ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </button>

                                {/* ===== Collapsible Body ===== */}
                                {isOpen && (
                                    <div className="border-t px-4 py-4 space-y-4 bg-slate-50">
                                        {/* Image */}
                                        <div>
                                            {c.imageUrl ? (
                                                <img
                                                    src={c.imageUrl}
                                                    className="w-full h-40 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="h-40 border-2 border-dashed rounded flex items-center justify-center text-xs text-slate-400">
                                                    No image
                                                </div>
                                            )}

                                            <label className="text-xs text-blue-600 cursor-pointer mt-2 inline-block">
                                                Upload / Replace
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) =>
                                                        uploadClientImage(
                                                            c.clientId,
                                                            e.target.files?.[0]
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <textarea
                                                className="w-full border rounded px-3 py-2 text-xs"
                                                placeholder="Client notes"
                                                rows={3}
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
                                                    updateStatus(
                                                        c.clientId,
                                                        c.status,
                                                        c.description || ''
                                                    )
                                                }
                                                className="text-xs text-blue-600 mt-1"
                                            >
                                                Save notes
                                            </button>
                                        </div>

                                        {/* Interaction */}
                                        <div className="space-y-2">
                                            <select
                                                className="border rounded px-2 py-1 text-xs w-full"
                                                value={interactionType}
                                                onChange={(e) =>
                                                    setInteractionType(e.target.value)
                                                }
                                            >
                                                <option>Visit</option>
                                                <option>Call</option>
                                                <option>Meeting</option>
                                                <option>Follow-up</option>
                                            </select>

                                            <textarea
                                                className="w-full border rounded px-2 py-1 text-xs"
                                                placeholder="Interaction notes"
                                                value={interactionNotes}
                                                onChange={(e) =>
                                                    setInteractionNotes(e.target.value)
                                                }
                                            />

                                            <button
                                                onClick={() => addInteraction(c.clientId)}
                                                className="text-xs text-green-600"
                                            >
                                                + Add interaction
                                            </button>
                                        </div>

                                        <p className="text-xs text-slate-400">
                                            Updated: {c.updatedAt}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* 💻 DESKTOP VIEW (table) */}
                {filteredClients.length === 0 ? (
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
                    <div className="hidden md:block">
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
                                            <th className="px-6 py-4 text-left font-semibold text-slate-700">Notes / Description</th>
                                            <th className="px-6 py-4 text-left font-semibold text-slate-700">Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredClients.length === 0 && (
                                            <div className="bg-white rounded-xl border p-6 text-center text-slate-500">
                                                No matching clients found
                                            </div>
                                        )}

                                        {filteredClients.map((c) => (
                                            <Fragment key={c.clientId}>
                                                {/* SUMMARY ROW */}
                                                <tr
                                                    onClick={() =>
                                                        setOpenClientId(openClientId === c.clientId ? null : c.clientId)
                                                    }
                                                    className="cursor-pointer hover:bg-slate-50 transition"
                                                >
                                                    <td className="px-6 py-4 font-medium">{c.businessName}</td>
                                                    <td className="px-6 py-4">{c.industry}</td>
                                                    <td className="px-6 py-4">{c.location}</td>
                                                    <td className="px-6 py-4">{c.status}</td>

                                                    {/* PLACEHOLDER CELLS (important) */}
                                                    <td className="px-6 py-4 text-slate-400 text-xs">🔽</td>
                                                    <td className="px-6 py-4 text-slate-400 text-xs">🔽</td>

                                                    <td className="px-6 py-4 text-xs text-slate-500">
                                                        {c.updatedAt}
                                                    </td>
                                                </tr>

                                                {/* EXPANDED ROW */}
                                                {openClientId === c.clientId && (
                                                    <tr>
                                                        <td colSpan={7} className="bg-slate-50 px-6 py-5">
                                                            <div className="grid grid-cols-3 gap-6">

                                                                {/* IMAGE */}
                                                                <div>
                                                                    <div className="h-24 w-32 rounded border border-slate-300 bg-white flex items-center justify-center overflow-hidden mb-2">
                                                                        {c.imageUrl ? (
                                                                            <a href={c.imageUrl} target="_blank">
                                                                                <img
                                                                                    src={c.imageUrl}
                                                                                    className="h-full w-full object-cover"
                                                                                />
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-xs text-slate-400">
                                                                                No image
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <label className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
                                                                        {uploadingId === c.clientId ? 'Uploading…' : 'Upload / Replace'}
                                                                        <input
                                                                            type="file"
                                                                            hidden
                                                                            accept="image/*"
                                                                            onChange={(e) =>
                                                                                uploadClientImage(c.clientId, e.target.files?.[0])
                                                                            }
                                                                        />
                                                                    </label>
                                                                </div>

                                                                {/* NOTES */}
                                                                <div>
                                                                    <label className="text-xs text-slate-500 font-semibold">
                                                                        Notes
                                                                    </label>
                                                                    <textarea
                                                                        className="w-full border rounded px-2 py-1 text-sm mt-1"
                                                                        rows={3}
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
                                                                        className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                                                                    >
                                                                        Save Notes
                                                                    </button>
                                                                </div>

                                                                {/* INTERACTION */}
                                                                <div>
                                                                    <label className="text-xs text-slate-500 font-semibold">
                                                                        Add Interaction
                                                                    </label>

                                                                    <select
                                                                        className="w-full border rounded px-2 py-1 text-sm mt-1"
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
                                                                        className="w-full border rounded px-2 py-1 text-sm mt-2"
                                                                        rows={2}
                                                                        placeholder="What happened?"
                                                                        value={interactionNotes}
                                                                        onChange={(e) => setInteractionNotes(e.target.value)}
                                                                    />

                                                                    <button
                                                                        onClick={() => addInteraction(c.clientId)}
                                                                        className="mt-2 text-xs text-green-600 font-semibold hover:underline"
                                                                    >
                                                                        + Record Interaction
                                                                    </button>
                                                                </div>

                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
