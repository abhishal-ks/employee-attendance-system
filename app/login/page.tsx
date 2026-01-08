'use client';

import { JSX, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface LoginResponse {
    success: boolean
    message: string
}

export default function Login(): JSX.Element {
    const [employeeId, setEmployeeId] = useState<string>('')
    const router = useRouter()

    const login = async (): Promise<void> => {
        if (!employeeId) {
            alert('Enter Employee ID')
            return
        }

        try {
            const res = await axios.post<LoginResponse>(
                process.env.NEXT_PUBLIC_APPS_SCRIPT_URL as string,
                JSON.stringify({
                    type: 'LOGIN',
                    employeeId,
                }),
                {
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                }
            );

            if (!res.data.success) {
                alert(res.data.message)
                return
            }

            localStorage.setItem('employeeId', employeeId)
            router.push('/attendance')
        } catch {
            alert('Login failed')
        }
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
