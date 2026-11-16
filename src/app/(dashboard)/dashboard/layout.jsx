import React from 'react';
import Navbar from '@/component/homepage/Navbar';
import Sidebar from '@/component/dashboard/Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="sticky top-0 z-30 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                <Navbar />
            </header>

            <div className="flex flex-1 gap-5 px-4 py-5 md:px-6">
                <Sidebar />

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
