'use client'

// 1️⃣ Normal imports
import { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useMap } from 'react-leaflet'

// 2️⃣ Leaflet + CSS
import 'leaflet/dist/leaflet.css'
import { fixLeafletIcons } from '@/lib/leafletIconFix'

// 3️⃣ Next dynamic import
import dynamic from 'next/dynamic'
import AdminTopBar from '@/components/AdminTopBar'

// 4️⃣ 🔑 DYNAMIC IMPORTS
const MapContainer = dynamic(
    () => import('react-leaflet').then(m => m.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then(m => m.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then(m => m.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then(m => m.Popup),
    { ssr: false }
)

interface Client {
    clientId: string
    employeeId: string
    businessName: string
    industry: string
    location: string
    status: string
    updatedAt: string
    latitude?: string
    longitude?: string
}

function FixMapSize() {
    const map = useMap()

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize()
        }, 100)
    }, [map])

    return null
}

export default function AdminPanel(): JSX.Element {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    // Filter and search states
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [employeeFilter, setEmployeeFilter] = useState<string>('ALL')
    const [search, setSearch] = useState('')

    const [interactions, setInteractions] = useState<any[]>([])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fixLeafletIcons()
        }
    }, [])

    useEffect(() => {
        const role = localStorage.getItem('role')
        if (role !== 'admin') {
            router.replace('/dashboard')
        }
    }, [router])

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
            )
            .then((res) => {
                if (res.data.success) {
                    setClients(res.data.clients || [])
                }
            })
            .finally(() => setLoading(false))

        // Fetch interactions
        axios.post(
            process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
            JSON.stringify({
                type: 'GET_CLIENT_INTERACTIONS_ADMIN',
                employeeId
            })
        ).then(res => {
            if (res.data.success) setInteractions(res.data.interactions || [])
        })

    }, [router])

    // Derived stats
    const totalClients = clients.length
    const convertedClients = clients.filter(c => c.status === 'Converted').length
    const activeClients = clients.filter(
        c => c.status !== 'Not Interested'
    ).length

    const uniqueEmployees = Array.from(
        new Set(clients.map(c => c.employeeId))
    )

    // Filtering logic
    const filteredClients = clients.filter(c => {
        const matchStatus =
            statusFilter === 'ALL' || c.status === statusFilter

        const matchEmployee =
            employeeFilter === 'ALL' || c.employeeId === employeeFilter

        const matchSearch =
            c.businessName.toLowerCase().includes(search.toLowerCase())

        return matchStatus && matchEmployee && matchSearch
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
                <AdminTopBar />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-slate-600">Loading clients...</p>
                    </div>
                </div>
            </div>
        )
    }

    const clientsWithGPS = clients.filter(
        c =>
            c.latitude &&
            c.longitude &&
            !isNaN(Number(c.latitude)) &&
            !isNaN(Number(c.longitude))
    )

    const mapCenter: [number, number] =
        clientsWithGPS.length > 0
            ? [
                Number(clientsWithGPS[0].latitude),
                Number(clientsWithGPS[0].longitude),
            ]
            : [28.6139, 77.2090] // Delhi fallback

    // CSV Download Function
    const downloadCSV = async () => {
        const employeeId = localStorage.getItem('employeeId')
        if (!employeeId) return

        const res = await fetch(
            process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
            {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    type: 'DOWNLOAD_CLIENTS_CSV',
                    employeeId,
                }),
            }
        )

        const text = await res.text()

        const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = 'clients.csv'
        link.click()

        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
            <AdminTopBar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center gap-2 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Client Management</h1>
                        <p className="text-slate-600 mt-1">View and manage all business clients</p>
                    </div>

                    <div className="flex items-center gap-4 flex-col">
                        <button
                            onClick={() => router.push('/admin')}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 cursor-pointer transition-colors duration-300 text-sm font-medium"
                        >
                            ← Back to Admin
                        </button>

                        <button
                            onClick={downloadCSV}
                            className="text-sm bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 cursor-pointer font-medium"
                        >
                            Download CSV
                        </button>
                    </div>
                </div>

                {clientsWithGPS.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 mb-8">
                        <MapContainer
                            center={mapCenter}
                            zoom={6}
                            style={{ height: '400px', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />

                            {clientsWithGPS.map(c => (
                                <Marker
                                    key={c.clientId}
                                    position={[
                                        Number(c.latitude),
                                        Number(c.longitude),
                                    ]}
                                >
                                    <Popup>
                                        <strong>{c.businessName}</strong><br />
                                        Employee: {c.employeeId}<br />
                                        Status: {c.status}<br />
                                        Location: {c.location}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Filters</h2>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-64">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Search business name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </div>

                        <div className="flex-1 min-w-48">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                <option value="ALL">All Status</option>
                                <option value="Lead Generated">Lead Generated</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Meeting Scheduled">Meeting Scheduled</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Negotiation">Negotiation</option>
                                <option value="Converted">Converted</option>
                                <option value="Follow-up Required">Follow-up Required</option>
                                <option value="Not Interested">Not Interested</option>
                            </select>
                        </div>

                        <div className="flex-1 min-w-48">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Employee</label>
                            <select
                                value={employeeFilter}
                                onChange={e => setEmployeeFilter(e.target.value)}
                                className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                <option value="ALL">All Employees</option>
                                {uniqueEmployees.map(emp => (
                                    <option key={emp} value={emp}>
                                        {emp}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <p className="text-sm font-medium text-slate-600 mb-2">Total Clients</p>
                        <p className="text-4xl font-bold text-blue-600">{totalClients}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <p className="text-sm font-medium text-slate-600 mb-2">Active Clients</p>
                        <p className="text-4xl font-bold text-amber-600">{activeClients}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <p className="text-sm font-medium text-slate-600 mb-2">Converted</p>
                        <p className="text-4xl font-bold text-green-600">{convertedClients}</p>
                    </div>
                </div>

                {/* ================= INTERACTIONS ================= */}

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                        Client Interactions
                    </h2>

                    {interactions.length === 0 ? (
                        <p className="text-sm text-gray-500">No interactions recorded yet.</p>
                    ) : (
                        <div className="space-y-3 max-h-100 overflow-y-auto">
                            {interactions.map((i, idx) => (
                                <div
                                    key={idx}
                                    className="border rounded-lg p-3 text-sm bg-slate-50"
                                >
                                    <div className="font-medium text-slate-900">
                                        {i.employeeName} → {i.businessName}
                                    </div>

                                    <div className="text-gray-600 text-xs">
                                        {i.interactionType} • {i.date} {i.time}
                                    </div>

                                    {i.notes && (
                                        <div className="mt-1 text-gray-700">
                                            {i.notes}
                                        </div>
                                    )}

                                    {!isNaN(Number(i.latitude)) && !isNaN(Number(i.longitude)) && (
                                        <a
                                            href={`https://www.google.com/maps?q=${i.latitude},${i.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-xs hover:underline mt-1 inline-block"
                                        >
                                            View Location
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-linear-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Business</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Employee</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Client ID</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Industry</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Location</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredClients.map((c) => (
                                    <tr key={c.clientId} className="hover:bg-slate-50 transition-colors duration-200">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {c.businessName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{c.employeeId}</td>
                                        <td className="px-6 py-4 text-slate-600">{c.clientId}</td>
                                        <td className="px-6 py-4 text-slate-600">{c.industry}</td>
                                        <td className="px-6 py-4 text-slate-600">{c.location}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {c.updatedAt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
