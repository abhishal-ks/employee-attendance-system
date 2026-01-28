'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface WhoAmIResponse {
    success: boolean
    employeeId: string
    name: string
}

export default function DashboardTopBar() {
    const router = useRouter()
    const [name, setName] = useState('')
    const employeeId = typeof window !== 'undefined'
        ? localStorage.getItem('employeeId')
        : null

    useEffect(() => {
        if (!employeeId) return

        axios.post(
            process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
            JSON.stringify({
                type: 'WHOAMI',
                employeeId,
            }),
            { headers: { 'Content-Type': 'text/plain' } }
        ).then(res => {
            if (res.data.success) {
                setName(res.data.name)
            }
        })
    }, [employeeId])

    const logout = () => {
        localStorage.clear()
        router.replace('/login')
    }

    return (
        <div className="bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="font-bold text-slate-900">{name || 'Employee'}</h2>
                    <p className="text-xs text-slate-500">{employeeId}</p>
                </div>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    EMPLOYEE
                </span>
            </div>

            <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors duration-300 text-sm"
            >
                Logout
            </button>
        </div>
    )
}
