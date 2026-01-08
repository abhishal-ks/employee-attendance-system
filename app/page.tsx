'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home(): null {
  const router = useRouter();

  useEffect(() => {
    const employeeId = localStorage.getItem('employeeId');

    if (employeeId) {
      router.replace('/attendance');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null
}
