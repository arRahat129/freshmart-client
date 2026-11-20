'use client';

import React from 'react';
import { useSession } from '@/lib/auth-client';
import Navbar from '@/component/homepage/Navbar';
import Sidebar from '@/component/dashboard/Sidebar';
import UnauthorizedPage from '@/app/unauthorized/page';

const DashboardLayout = ({ children }) => {
    const { data: session, isPending } = useSession();
    const isAuthenticated = Boolean(session?.user);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {isPending ? (
                <div className="flex items-center justify-center h-screen bg-gray-50">
                    <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm font-medium text-gray-600">Verifying authentication...</p>
                    </div>
                </div>
            ) : !isAuthenticated ? (
                <UnauthorizedPage />
            ) : (
                <>
                    <header className="sticky top-0 z-30 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                        <Navbar />
                    </header>

                    <div className="flex flex-1 gap-5 px-4 py-5 md:px-6">
                        <Sidebar />

                        <main className="flex-1 min-w-0">
                            {children}
                        </main>
                    </div>
                </>
            )}

            {(isPending || !isAuthenticated) && (
                <div hidden aria-hidden="true">
                    {children}
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;