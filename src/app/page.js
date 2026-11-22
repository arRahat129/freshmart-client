'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/component/homepage/Navbar";
import { useSession } from "@/lib/auth-client";
import { Button, Card } from "@heroui/react";
import Link from "next/link";
import { FiArrowRight, FiClock, FiGrid, FiMail, FiShield, FiUser } from "react-icons/fi";

const formatLiveDateTime = (now = new Date()) => {
  const datePart = now.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timePart = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return `${datePart} • ${timePart}`;
};

export default function Home() {
  const [dateTimeText, setDateTimeText] = useState('');
  const [copyrightYear, setCopyrightYear] = useState(2026);
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const userRole = String(user?.role || '').toLowerCase();

  useEffect(() => {
    const syncClock = () => {
      const now = new Date();
      setDateTimeText(formatLiveDateTime(now));
      setCopyrightYear(now.getFullYear());
    };

    const initialTimeoutId = setTimeout(syncClock, 0);
    const intervalId = setInterval(syncClock, 1000);

    return () => {
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50/30 to-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-emerald-100/80 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-600">
          <span className="font-semibold text-emerald-700 uppercase tracking-wider">
            FreshMart POS
          </span>
          <div className="inline-flex items-center gap-1.5 font-mono font-medium text-gray-700">
            <FiClock className="text-emerald-600 shrink-0" size={14} />
            <span>{dateTimeText || 'Loading time...'}</span>
          </div>
        </div>
      </div>

      <main className="grow flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center space-y-8">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-sm font-medium animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            Next-Gen Supermarket POS Ecosystem
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Streamline Your Store With <span className="text-emerald-600">FreshMart</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 font-normal">
            A lightning-fast, secure, and multi-branch point-of-sale platform built for modern retail inventory and checkout management.
          </p>

          <div className="flex justify-center pt-4">
            <Card className="w-full max-w-md border border-emerald-100/80 shadow-xl shadow-emerald-950/5 bg-white/85 backdrop-blur-md rounded-2xl p-2">
              {isPending ? (
                <div className="py-8 px-8 text-center space-y-3">
                  <div className="w-7 h-7 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-500">Checking session...</p>
                </div>
              ) : user ? (
                <div className="py-6 px-7 text-left space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Active Session
                    </span>
                    {userRole && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {userRole}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2 text-sm">
                    <div className="flex items-center gap-2.5 text-gray-900 font-semibold">
                      <FiUser className="text-emerald-600 shrink-0" size={16} />
                      <span className="truncate">{user.name || 'Signed-in User'}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center gap-2.5 text-gray-600 text-xs">
                        <FiMail className="text-emerald-600 shrink-0" size={15} />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    {userRole && (
                      <div className="flex items-center gap-2.5 text-gray-600 text-xs">
                        <FiShield className="text-emerald-600 shrink-0" size={15} />
                        <span>Role: <strong className="uppercase text-gray-800">{userRole}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <Link href="/dashboard" className="w-full block">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
                      >
                        <FiGrid size={18} />
                        Go Back to Dashboard
                        <FiArrowRight size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-6 px-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl mx-auto flex items-center justify-center text-xl shadow-inner">
                    🛒
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Ready to Get Started?</h3>
                    <p className="text-sm text-gray-500 mt-1">Access your administrative terminal or cashier register.</p>
                  </div>

                  <div className="pt-2">
                    <Link href="/auth/login" className="w-full block">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
                      >
                        Sign In to Dashboard
                        <FiArrowRight size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-gray-200/60 max-w-3xl mx-auto text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-gray-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">⚡</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Real-Time Sync</h4>
                <p className="text-xs text-gray-500">Instant inventory and sales tracking across terminals.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-gray-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">🔒</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Secure Access</h4>
                <p className="text-xs text-gray-500">Role-based authentication powered by Better Auth.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-gray-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">📈</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Smart Reports</h4>
                <p className="text-xs text-gray-500">Comprehensive analytics for daily business insights.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        &copy; {copyrightYear} FreshMart Supermarket POS. All rights reserved.
      </footer>
    </div>
  );
}