'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

const DashboardRoot = () => {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending) {
            if (!session) {
                router.push('/auth/login');
            } else {
                const userRole = session.user?.role || 'cashier';

                router.push(`/dashboard/${userRole}`);
            }
        }
    }, [session, isPending, router]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center space-y-3">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-medium text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default DashboardRoot;