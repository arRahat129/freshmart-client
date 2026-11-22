'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card } from '@heroui/react';
import {
    FiTrendingUp,
    FiDollarSign,
    FiShoppingBag,
    FiAlertTriangle,
    FiGitBranch,
    FiClipboard,
    FiFileText,
    FiBox,
    FiUsers,
    FiRefreshCw,
    FiAward,
    FiArrowUpRight,
    FiLayers
} from 'react-icons/fi';
import { useSession } from '@/lib/auth-client';
import { useRoleGuard } from '@/lib/useRoleGuard';
import { getTopDashboardStats } from '@/lib/api/dashboard';

const TOP_ROLES = ['owner', 'superadmin', 'admin'];

const ROLE_META = {
    owner: {
        label: 'Owner',
        badge: 'bg-violet-100 text-violet-800 border-violet-200',
        subtitle: 'Complete business performance, multi-branch revenue, and profit overview.'
    },
    superadmin: {
        label: 'Super Admin',
        badge: 'bg-sky-100 text-sky-800 border-sky-200',
        subtitle: 'Network-wide sales, branch revenue tracking, stock alerts, and manager requests.'
    },
    admin: {
        label: 'Admin',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        subtitle: 'Operations overview, warehouse low-stock alerts, and pending branch requests.'
    }
};

const formatCurrency = (val) =>
    `৳${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompactDate = (dateVal) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    return Number.isNaN(d.getTime())
        ? '—'
        : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const statusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s === 'rejected') return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
};

export default function TopDashboardView() {
    const { isPending: guardPending, allowed } = useRoleGuard(TOP_ROLES);
    const { data: session } = useSession();
    const role = String(session?.user?.role || '').toLowerCase();
    const roleInfo = ROLE_META[role] || ROLE_META.admin;

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (guardPending || !allowed) return;

        let active = true;
        Promise.resolve().then(async () => {
            if (!active) return;
            setLoading(true);
            try {
                const res = await getTopDashboardStats();
                if (!active) return;
                setStats(res?.success ? res.data : null);
            } catch (err) {
                console.error('Failed to load executive dashboard:', err);
                if (active) setStats(null);
            } finally {
                if (active) setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [guardPending, allowed, refreshKey]);

    const branchChartMax = useMemo(() => {
        const list = stats?.branchRevenue || [];
        const maxVal = list.reduce(
            (max, b) => Math.max(max, Number(b.regularRevenue || 0), Number(b.weeklyRevenue || 0)),
            0
        );
        return maxVal > 0 ? maxVal : 1;
    }, [stats]);

    const dailyChartMax = useMemo(() => {
        const list = stats?.dailySeries || [];
        const maxVal = list.reduce((max, d) => Math.max(max, Number(d.sell || 0)), 0);
        return maxVal > 0 ? maxVal : 1;
    }, [stats]);

    if (guardPending || !allowed) {
        return (
            <div className="max-w-7xl mx-auto p-12 text-center text-sm text-gray-500">
                Checking permissions...
            </div>
        );
    }

    const sales = stats?.sales || {};
    const profit = stats?.profit || {};
    const branchRevenue = stats?.branchRevenue || [];
    const dailySeries = stats?.dailySeries || [];
    const effectiveProducts = stats?.effectiveProducts || [];
    const mainProductLowStock = stats?.mainProductLowStock || [];
    const recentManagerRequests = stats?.recentManagerRequests || [];

    const monthlyMarginPct =
        Number(profit.monthlySellTotal || 0) > 0
            ? ((Number(profit.monthlyProfit || 0) / Number(profit.monthlySellTotal || 1)) * 100).toFixed(1)
            : '0.0';

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleInfo.badge}`}>
                            {roleInfo.label} Dashboard
                        </span>
                        {stats?.period?.monthKey && (
                            <span className="text-xs font-medium text-gray-400">
                                Period: {stats.period.monthKey}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Welcome back, {session?.user?.name || roleInfo.label}
                    </h1>
                    <p className="text-sm text-gray-500">{roleInfo.subtitle}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {role === 'owner' && (
                        <Link href="/dashboard/owner/branches">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                <FiGitBranch size={16} className="mr-1.5" /> Branches
                            </Button>
                        </Link>
                    )}
                    <Link href="/dashboard/branch-requests">
                        <Button
                            variant={role === 'owner' ? 'bordered' : 'solid'}
                            className={
                                role === 'owner'
                                    ? 'border-emerald-300 text-emerald-800 font-semibold'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                            }
                        >
                            <FiClipboard size={16} className="mr-1.5" /> Branch Requests
                        </Button>
                    </Link>
                    <Link href="/dashboard/all-receipt">
                        <Button variant="bordered" className="border-gray-300 text-gray-800 font-semibold">
                            <FiFileText size={16} className="mr-1.5" /> All Receipts
                        </Button>
                    </Link>
                    <Link href="/dashboard/products">
                        <Button variant="bordered" className="border-gray-300 text-gray-800 font-semibold">
                            <FiBox size={16} className="mr-1.5" /> Products
                        </Button>
                    </Link>
                    <Link href="/dashboard/users">
                        <Button variant="bordered" className="border-gray-300 text-gray-800 font-semibold">
                            <FiUsers size={16} className="mr-1.5" /> Users
                        </Button>
                    </Link>
                    <Button
                        isIconOnly
                        variant="bordered"
                        aria-label="Refresh dashboard"
                        onPress={() => setRefreshKey((k) => k + 1)}
                        className="border-gray-200 text-gray-600"
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            {loading ? (
                <Card className="p-12 text-center border border-gray-200 rounded-2xl bg-white text-sm text-gray-500">
                    Loading executive analytics...
                </Card>
            ) : !stats ? (
                <Card className="p-12 text-center border border-gray-200 rounded-2xl bg-white text-sm text-gray-500">
                    Unable to load dashboard stats right now.
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <Card className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Daily Sell (Today)
                                </span>
                                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                    <FiShoppingBag size={18} />
                                </span>
                            </div>
                            <p className="text-2xl font-extrabold text-gray-900">
                                {formatCurrency(sales.dailySell)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {sales.dailyReceiptsCount || 0} {sales.dailyReceiptsCount === 1 ? 'receipt' : 'receipts'} today
                            </p>
                        </Card>

                        <Card className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Monthly Sell
                                </span>
                                <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
                                    <FiTrendingUp size={18} />
                                </span>
                            </div>
                            <p className="text-2xl font-extrabold text-gray-900">
                                {formatCurrency(sales.monthlySell)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {sales.monthlyReceiptsCount || 0} {sales.monthlyReceiptsCount === 1 ? 'receipt' : 'receipts'} this month
                            </p>
                        </Card>

                        <Card className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                    Monthly Profit
                                </span>
                                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                                    <FiDollarSign size={18} />
                                </span>
                            </div>
                            <p className={`text-2xl font-extrabold ${Number(profit.monthlyProfit) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {formatCurrency(profit.monthlyProfit)}
                            </p>
                            <p className="text-xs text-gray-500">
                                Cost: {formatCurrency(profit.monthlyCostTotal)} • Margin: {monthlyMarginPct}%
                            </p>
                        </Card>

                        <Card className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Daily Profit (Today)
                                </span>
                                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                    <FiLayers size={18} />
                                </span>
                            </div>
                            <p className={`text-2xl font-extrabold ${Number(profit.dailyProfit) >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                                {formatCurrency(profit.dailyProfit)}
                            </p>
                            <p className="text-xs text-gray-500">
                                Today&apos;s Product Cost: {formatCurrency(profit.dailyCostTotal)}
                            </p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <Card className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Branch Regular &amp; Weekly Revenue
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Today&apos;s regular revenue vs. 7-day weekly revenue by branch
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Regular (Today)
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Weekly (7D)
                                    </span>
                                </div>
                            </div>

                            {branchRevenue.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center">No branch revenue recorded yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {branchRevenue.map((branch) => {
                                        const regPct = Math.min(100, Math.round((Number(branch.regularRevenue || 0) / branchChartMax) * 100));
                                        const weekPct = Math.min(100, Math.round((Number(branch.weeklyRevenue || 0) / branchChartMax) * 100));

                                        return (
                                            <div key={branch.branchId} className="space-y-1.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-gray-900">{branch.branchName}</span>
                                                    <span className="text-gray-500">
                                                        Month: <strong className="text-gray-800">{formatCurrency(branch.monthlyRevenue)}</strong> ({branch.receiptCount} bills)
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                                                        <span>Regular (Today)</span>
                                                        <span className="font-bold text-emerald-700">{formatCurrency(branch.regularRevenue)}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                                                            style={{ width: `${regPct}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                                                        <span>Weekly (7 Days)</span>
                                                        <span className="font-bold text-sky-700">{formatCurrency(branch.weeklyRevenue)}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-sky-500 rounded-full transition-all duration-300"
                                                            style={{ width: `${weekPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>

                        <Card className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-bold text-gray-900">Daily Sell &amp; Profit Trend</h2>
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase">This Month</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Daily checkout revenue vs. calculated profit
                                </p>
                            </div>

                            {dailySeries.length === 0 ? (
                                <p className="text-xs text-gray-400 py-12 text-center">No sales activity recorded this month.</p>
                            ) : (
                                <div className="h-52 flex items-end gap-2 pt-6 pb-2 px-1 border-b border-gray-100 overflow-x-auto">
                                    {dailySeries.slice(-14).map((day) => {
                                        const sellHeight = Math.max(8, Math.round((Number(day.sell || 0) / dailyChartMax) * 100));
                                        const profitHeight = Math.max(
                                            4,
                                            Math.round((Math.max(0, Number(day.profit || 0)) / dailyChartMax) * 100)
                                        );
                                        const shortLabel = day.date.slice(5);

                                        return (
                                            <div
                                                key={day.date}
                                                className="flex-1 min-w-7 flex flex-col items-center gap-1.5 group"
                                                title={`${day.date} • Sell: ${formatCurrency(day.sell)} • Profit: ${formatCurrency(day.profit)}`}
                                            >
                                                <div className="w-full h-36 flex items-end justify-center gap-1">
                                                    <div
                                                        className="w-2.5 bg-sky-500 rounded-t transition-all"
                                                        style={{ height: `${sellHeight}%` }}
                                                    />
                                                    <div
                                                        className="w-2.5 bg-emerald-600 rounded-t transition-all"
                                                        style={{ height: `${profitHeight}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-mono text-gray-500">{shortLabel}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Daily Sell
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Daily Profit
                                    </span>
                                </div>
                                <span className="font-semibold text-emerald-700">
                                    Net: {formatCurrency(profit.monthlyProfit)}
                                </span>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <Card className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <FiAward className="text-emerald-600" /> Most Effective Products
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Top performing products ranked by monthly revenue, units sold, and profit
                                    </p>
                                </div>
                                <Link href="/dashboard/products" className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
                                    Catalog <FiArrowUpRight size={13} />
                                </Link>
                            </div>

                            {effectiveProducts.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center">No product sales data available yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-gray-400 uppercase">
                                                <th className="py-2.5 pr-3">Product</th>
                                                <th className="py-2.5 px-3 text-right">Sold</th>
                                                <th className="py-2.5 px-3 text-right">Revenue</th>
                                                <th className="py-2.5 pl-3 text-right">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {effectiveProducts.map((prod, idx) => (
                                                <tr key={prod.productId} className="hover:bg-gray-50/70">
                                                    <td className="py-3 pr-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                                                                {idx + 1}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-gray-900 truncate">{prod.productName}</p>
                                                                {prod.sku && (
                                                                    <p className="text-[11px] font-mono text-gray-400">{prod.sku}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                                                        {prod.quantitySold} pcs
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-bold text-gray-900 whitespace-nowrap">
                                                        {formatCurrency(prod.revenue)}
                                                    </td>
                                                    <td className={`py-3 pl-3 text-right font-bold whitespace-nowrap ${Number(prod.profit) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                        {formatCurrency(prod.profit)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        <Card className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <FiAlertTriangle className="text-amber-500" /> Main Inventory Low Stock
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Warehouse products at or below low-stock threshold
                                    </p>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                    {mainProductLowStock.length} Alerts
                                </span>
                            </div>

                            {mainProductLowStock.length === 0 ? (
                                <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-50/60 rounded-xl border border-emerald-100">
                                    All main warehouse products are well stocked.
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                                    {mainProductLowStock.map((item) => (
                                        <div
                                            key={String(item._id)}
                                            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/70"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {item.images?.[0] && (
                                                    <Image
                                                        src={item.images[0]}
                                                        alt={item.name}
                                                        width={36}
                                                        height={36}
                                                        unoptimized
                                                        className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                                                    />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-[11px] font-mono text-gray-500">{item.sku}</p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span
                                                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${item.totalStock === 0
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                >
                                                    {item.totalStock === 0 ? 'Out of Stock' : `${item.totalStock} left`}
                                                </span>
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    Min: {item.lowStockThreshold}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    <Card className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Recent Requests by Managers</h2>
                                <p className="text-xs text-gray-500">
                                    Latest branch stock demands and custom product requests submitted by branch managers
                                </p>
                            </div>
                            <Link href="/dashboard/branch-requests">
                                <Button size="sm" variant="bordered" className="border-emerald-300 text-emerald-800 font-semibold">
                                    Review All Requests <FiArrowUpRight size={14} className="ml-1" />
                                </Button>
                            </Link>
                        </div>

                        {recentManagerRequests.length === 0 ? (
                            <p className="text-xs text-gray-400 py-8 text-center">No recent manager requests found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                                            <th className="py-3 px-3">Type</th>
                                            <th className="py-3 px-3">Branch</th>
                                            <th className="py-3 px-3">Product</th>
                                            <th className="py-3 px-3">Requested By</th>
                                            <th className="py-3 px-3">Quantity</th>
                                            <th className="py-3 px-3">Date</th>
                                            <th className="py-3 px-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentManagerRequests.map((req) => (
                                            <tr key={`${req.requestType}-${String(req._id)}`} className="hover:bg-gray-50/70">
                                                <td className="py-3 px-3 whitespace-nowrap">
                                                    <span
                                                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${req.requestType === 'custom'
                                                                ? 'bg-indigo-100 text-indigo-800'
                                                                : 'bg-sky-100 text-sky-800'
                                                            }`}
                                                    >
                                                        {req.requestLabel}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 font-bold text-gray-800 whitespace-nowrap">
                                                    {req.branchName}
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-gray-900">
                                                    {req.productName}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <p className="font-semibold text-gray-800">{req.managerName}</p>
                                                    {req.managerEmail && (
                                                        <p className="text-[11px] text-gray-400">{req.managerEmail}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-gray-700 whitespace-nowrap">
                                                    {req.totalQuantity} pcs ({req.variantsCount} {req.variantsCount === 1 ? 'variant' : 'variants'})
                                                </td>
                                                <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                                                    {formatCompactDate(req.createdAt)}
                                                </td>
                                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeClass(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}