'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { FiLock, FiHome, FiGrid, FiLogOut } from 'react-icons/fi';
import Image from 'next/image';
import { useSession, signOut } from '@/lib/auth-client';

export default function ForbiddenPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [signingOut, setSigningOut] = useState(false);
    const user = session?.user;

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await signOut();
            router.replace('/auth/login');
            router.refresh();
        } catch (error) {
            console.error('Failed to sign out:', error);
            setSigningOut(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50/50 via-white to-gray-50 p-4">
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                    <FiLock size={28} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Access Forbidden</h1>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                        You do not have the required permissions to access this resource. Please contact your system administrator if you think this is a mistake.
                    </p>
                </div>

                {!isPending && user && (
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3 flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{user.name?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-xs truncate">{user.name}</p>
                            <span className="inline-block bg-emerald-200/60 text-emerald-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                Role: {user.role || 'Member'}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2.5 pt-2">
                    <Link href="/dashboard" className="w-full">
                        <Button
                            variant="flat"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm h-11 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                        >
                            <FiGrid className="size-4" /> Back to Dashboard
                        </Button>
                    </Link>

                    <Link href="/" className="w-full">
                        <Button
                            variant="flat"
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm h-11 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <FiHome className="size-4" /> Go Back Home
                        </Button>
                    </Link>

                    <Button
                        type="button"
                        variant="flat"
                        isLoading={signingOut}
                        onPress={handleSignOut}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs sm:text-sm h-10 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <FiLogOut className="size-4" /> Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}