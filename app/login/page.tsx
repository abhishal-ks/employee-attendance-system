'use client'

import { JSX, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login(): JSX.Element {
    const [employeeId, setEmployeeId] = useState<string>('')
    const router = useRouter()

    const login = (): void => {
        if (!employeeId) {
            alert('Enter Employee ID')
            return
        }

        localStorage.setItem('employeeId', employeeId)
        router.push('/attendance')
    }

    return (
        <div>
            <h1>Smart Business Login</h1>

            <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
            />

            <button onClick={login}>Login</button>
        </div>
    )
}
