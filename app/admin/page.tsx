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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fixLeafletIcons()
        }
    }, [])

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
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading admin panel...
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

                    {clientsWithGPS.length > 0 && (
                        <div className="bg-white rounded shadow mb-6">
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

                    <div className="bg-white rounded shadow p-4 mb-4 flex flex-wrap gap-4 items-center">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search business…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border rounded px-3 py-1 text-sm"
                        />

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="border rounded px-3 py-1 text-sm"
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

                        {/* Employee Filter */}
                        <select
                            value={employeeFilter}
                            onChange={e => setEmployeeFilter(e.target.value)}
                            className="border rounded px-3 py-1 text-sm"
                        >
                            <option value="ALL">All Employees</option>
                            {uniqueEmployees.map(emp => (
                                <option key={emp} value={emp}>
                                    {emp}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded shadow p-4">
                            <p className="text-xs text-gray-500">Total Clients</p>
                            <p className="text-2xl font-semibold">{totalClients}</p>
                        </div>

                        <div className="bg-white rounded shadow p-4">
                            <p className="text-xs text-gray-500">Active Clients</p>
                            <p className="text-2xl font-semibold">{activeClients}</p>
                        </div>

                        <div className="bg-white rounded shadow p-4">
                            <p className="text-xs text-gray-500">Converted</p>
                            <p className="text-2xl font-semibold text-green-600">
                                {convertedClients}
                            </p>
                        </div>
                    </div>

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Business</th>
                                <th className="px-4 py-3 text-left">Employee</th>
                                <th className="px-4 py-3 text-left">Client ID</th>
                                <th className="px-4 py-3 text-left">Industry</th>
                                <th className="px-4 py-3 text-left">Location</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((c) => (
                                <tr key={c.clientId} className="border-t">
                                    <td className="px-4 py-3 font-medium">
                                        {c.businessName}
                                    </td>
                                    <td className="px-4 py-3">{c.employeeId}</td>
                                    <td className="px-4 py-3">{c.clientId}</td>
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
