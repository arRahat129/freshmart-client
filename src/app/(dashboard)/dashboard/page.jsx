'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import TopDashboardView from '@/component/dashboard/TopDashboardView';
import BranchDashboardView from '@/component/dashboard/BranchDashboardView';

const TOP_ROLES = new Set(['owner', 'superadmin', 'admin']);

const DashboardRoot = () => {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const userRole = String(session?.user?.role || '').toLowerCase();

    useEffect(() => {
        if (!isPending && !session) {
            router.replace('/auth/login');
        }
    }, [session, isPending, router]);

    if (isPending || !session) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-medium text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return TOP_ROLES.has(userRole) ? <TopDashboardView /> : <BranchDashboardView />;
};

export default DashboardRoot;