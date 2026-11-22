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
    FiClipboard,
    FiFileText,
    FiPackage,
    FiShoppingCart,
    FiRefreshCw,
    FiAward,
    FiArrowUpRight,
    FiCalendar,
    FiUserCheck
} from 'react-icons/fi';
import { useSession } from '@/lib/auth-client';
import { useRoleGuard } from '@/lib/useRoleGuard';
import { getManagerDashboardStats, getCashierDashboardStats } from '@/lib/api/dashboard';

const BRANCH_ROLES = ['manager', 'cashier'];

const ROLE_META = {
    manager: {
        label: 'Manager',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        subtitle: 'Branch operations, sales & profit performance, cashier leaderboard, stock alerts, and requests.'
    },
    cashier: {
        label: 'Cashier',
        badge: 'bg-sky-100 text-sky-800 border-sky-200',
        subtitle: 'Branch checkout performance, daily & monthly sales, cashier sales ranking, and stock visibility.'
    }
};

const CASHIER_METRICS = [
    { key: 'revenue', label: 'Monthly Sell', isCurrency: true },
    { key: 'weeklyRevenue', label: 'Weekly (7D)', isCurrency: true },
    { key: 'dailyRevenue', label: 'Today Sell', isCurrency: true },
    { key: 'unitsSold', label: 'Units Sold', isCurrency: false }
];

const formatCurrency = (val) =>
    `৳${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatMetricValue = (val, isCurrency) =>
    isCurrency ? formatCurrency(val) : `${Number(val || 0).toLocaleString()} pcs`;

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

export default function BranchDashboardView() {
    const { isPending: guardPending, allowed } = useRoleGuard(BRANCH_ROLES);
    const { data: session } = useSession();
    const role = String(session?.user?.role || '').toLowerCase();
    const roleInfo = ROLE_META[role] || ROLE_META.cashier;

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [cashierMetric, setCashierMetric] = useState('revenue');

    useEffect(() => {
        if (guardPending || !allowed || !role) return;

        let active = true;
        Promise.resolve().then(async () => {
            if (!active) return;
            setLoading(true);
            try {
                const res =
                    role === 'manager'
                        ? await getManagerDashboardStats()
                        : await getCashierDashboardStats();
                if (!active) return;
                setStats(res?.success ? res.data : null);
            } catch (err) {
                console.error('Failed to load branch dashboard:', err);
                if (active) setStats(null);
            } finally {
                if (active) setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [guardPending, allowed, role, refreshKey]);

    const activeMetricConfig = useMemo(
        () => CASHIER_METRICS.find((m) => m.key === cashierMetric) || CASHIER_METRICS[0],
        [cashierMetric]
    );

    const sortedCashiers = useMemo(() => {
        const list = [...(stats?.cashierPerformance || [])];
        return list.sort(
            (a, b) => Number(b[cashierMetric] || 0) - Number(a[cashierMetric] || 0) || Number(b.revenue || 0) - Number(a.revenue || 0)
        );
    }, [stats, cashierMetric]);

    const cashierChartMax = useMemo(() => {
        const maxVal = sortedCashiers.reduce((max, c) => Math.max(max, Number(c[cashierMetric] || 0)), 0);
        return maxVal > 0 ? maxVal : 1;
    }, [sortedCashiers, cashierMetric]);

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

    const branch = stats?.branch || {};
    const sales = stats?.sales || {};
    const profit = stats?.profit || {};
    const dailySeries = stats?.dailySeries || [];
    const effectiveProducts = stats?.effectiveProducts || [];
    const branchLowStock = stats?.branchLowStock || [];
    const recentBranchRequests = stats?.recentBranchRequests || [];

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
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {branch.branchName || 'Assigned Branch'}
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
                    {role === 'cashier' && (
                        <Link href="/dashboard/pos">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                <FiShoppingCart size={16} className="mr-1.5" /> Open POS
                            </Button>
                        </Link>
                    )}
                    {role === 'manager' && (
                        <>
                            <Link href="/dashboard/manager/branch/products">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                    <FiPackage size={16} className="mr-1.5" /> Branch Products
                                </Button>
                            </Link>
                            <Link href="/dashboard/manager/request">
                                <Button variant="bordered" className="border-emerald-300 text-emerald-800 font-semibold">
                                    <FiClipboard size={16} className="mr-1.5" /> Stock Requests
                                </Button>
                            </Link>
                        </>
                    )}
                    <Link href="/dashboard/all-receipt">
                        <Button variant="bordered" className="border-gray-300 text-gray-800 font-semibold">
                            <FiFileText size={16} className="mr-1.5" /> Money Receipts
                        </Button>
                    </Link>
                    <Button
                        isIconOnly
                        variant="bordered"
                        aria-label="Refresh branch dashboard"
                        onPress={() => setRefreshKey((k) => k + 1)}
                        className="border-gray-200 text-gray-600"
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            {loading ? (
                <Card className="p-12 text-center border border-gray-200 rounded-2xl bg-white text-sm text-gray-500">
                    Loading branch analytics...
                </Card>
            ) : !stats ? (
                <Card className="p-12 text-center border border-gray-200 rounded-2xl bg-white text-sm text-gray-500">
                    Unable to load branch dashboard stats right now.
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
                                    Weekly Sell (7D)
                                </span>
                                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                    <FiCalendar size={18} />
                                </span>
                            </div>
                            <p className="text-2xl font-extrabold text-gray-900">
                                {formatCurrency(sales.weeklySell)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {sales.weeklyReceiptsCount || 0} {sales.weeklyReceiptsCount === 1 ? 'receipt' : 'receipts'} in last 7 days
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
                                    Branch Monthly Profit
                                </span>
                                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                                    <FiDollarSign size={18} />
                                </span>
                            </div>
                            <p className={`text-2xl font-extrabold ${Number(profit.monthlyProfit) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {formatCurrency(profit.monthlyProfit)}
                            </p>
                            <p className="text-xs text-gray-500">
                                Today Profit: {formatCurrency(profit.dailyProfit)} • Margin: {monthlyMarginPct}%
                            </p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <Card className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <FiUserCheck className="text-emerald-600" /> Cashier Sales Performance
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Compare cashiers in {branch.branchName || 'this branch'} by sales &amp; units sold
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {CASHIER_METRICS.map((m) => (
                                        <button
                                            key={m.key}
                                            type="button"
                                            onClick={() => setCashierMetric(m.key)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${cashierMetric === m.key
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                                                }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {sortedCashiers.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center">
                                    No cashier sales recorded for this branch yet.
                                </p>
                            ) : (
                                <div className="space-y-3.5">
                                    {sortedCashiers.map((c, index) => {
                                        const rawVal = Number(c[cashierMetric] || 0);
                                        const barPct = Math.min(100, Math.round((rawVal / cashierChartMax) * 100));
                                        const isLeader = index === 0 && rawVal > 0;

                                        return (
                                            <div
                                                key={c.cashierId}
                                                className={`p-3.5 rounded-xl border space-y-2 ${isLeader
                                                        ? 'bg-emerald-50/50 border-emerald-200'
                                                        : 'bg-gray-50/70 border-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-2 text-xs">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span
                                                            className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${index === 0
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : index === 1
                                                                        ? 'bg-sky-100 text-sky-800'
                                                                        : 'bg-gray-200 text-gray-700'
                                                                }`}
                                                        >
                                                            #{index + 1}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-gray-900 truncate">
                                                                {c.cashierName}
                                                                {isLeader && (
                                                                    <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                                                        Top Seller
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500">
                                                                {c.receiptsCount} receipts • {c.unitsSold} pcs • Profit: {formatCurrency(c.profit)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span className="font-extrabold text-sm text-gray-900 whitespace-nowrap">
                                                        {formatMetricValue(rawVal, activeMetricConfig.isCurrency)}
                                                    </span>
                                                </div>

                                                <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${index === 0 ? 'bg-emerald-600' : 'bg-sky-500'
                                                            }`}
                                                        style={{ width: `${Math.max(rawVal > 0 ? 4 : 0, barPct)}%` }}
                                                    />
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
                                    <h2 className="text-base font-bold text-gray-900">Daily Sell &amp; Profit</h2>
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase">This Month</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Branch daily checkout sell vs. profit
                                </p>
                            </div>

                            {dailySeries.length === 0 ? (
                                <p className="text-xs text-gray-400 py-12 text-center">No sales recorded this month.</p>
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
                                                className="flex-1 min-w-[28px] flex flex-col items-center gap-1.5"
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
                                        <FiAward className="text-emerald-600" /> Top Selling Branch Products
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Best-performing items in {branch.branchName || 'this branch'} this month
                                    </p>
                                </div>
                            </div>

                            {effectiveProducts.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center">No product sales recorded yet.</p>
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
                                        <FiAlertTriangle className="text-amber-500" /> Branch Low Stock
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Branch items at or below low-stock threshold
                                    </p>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                    {branchLowStock.length} Alerts
                                </span>
                            </div>

                            {branchLowStock.length === 0 ? (
                                <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-50/60 rounded-xl border border-emerald-100">
                                    All branch items are comfortably stocked.
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                                    {branchLowStock.map((item) => (
                                        <div
                                            key={`${item.productType}-${String(item._id)}`}
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
                                                    <p className="text-[11px] font-mono text-gray-500">
                                                        {item.sku || item.productType}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span
                                                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${item.stock === 0
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                >
                                                    {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
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
                                <h2 className="text-base font-bold text-gray-900">Recent Branch Requests</h2>
                                <p className="text-xs text-gray-500">
                                    Stock demands and custom product requests for {branch.branchName || 'this branch'}
                                </p>
                            </div>
                            {role === 'manager' && (
                                <Link href="/dashboard/manager/request">
                                    <Button size="sm" variant="bordered" className="border-emerald-300 text-emerald-800 font-semibold">
                                        Manage Requests <FiArrowUpRight size={14} className="ml-1" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {recentBranchRequests.length === 0 ? (
                            <p className="text-xs text-gray-400 py-8 text-center">No recent requests found for this branch.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                                            <th className="py-3 px-3">Type</th>
                                            <th className="py-3 px-3">Product</th>
                                            <th className="py-3 px-3">Quantity</th>
                                            <th className="py-3 px-3">Date</th>
                                            <th className="py-3 px-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentBranchRequests.map((req) => (
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
                                                <td className="py-3 px-3 font-semibold text-gray-900">
                                                    {req.productName}
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