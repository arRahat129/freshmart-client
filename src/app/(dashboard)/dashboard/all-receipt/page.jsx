'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card } from '@heroui/react';
import { FiEye, FiDownload, FiPlusCircle, FiFileText, FiUser, FiShoppingBag, FiLayers } from 'react-icons/fi';
import { useSession } from '@/lib/auth-client';
import { getAllReceipts } from '@/lib/api/checkout';
import { getAllBranches } from '@/lib/api/branch';
import ReceiptViewModal from '@/component/dashboard/pos/ReceiptViewModal';

const TOP_ROLES = new Set(['owner', 'superadmin', 'admin']);

const BRANCH_COLOR_THEMES = [
    { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600' },
    { badge: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-600' },
    { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-600' },
    { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-600' },
    { badge: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-600' },
    { badge: 'bg-teal-100 text-teal-800 border-teal-200', dot: 'bg-teal-600' },
    { badge: 'bg-violet-100 text-violet-800 border-violet-200', dot: 'bg-violet-600' },
    { badge: 'bg-cyan-100 text-cyan-800 border-cyan-200', dot: 'bg-cyan-600' },
];

const DEFAULT_BRANCH_THEME = {
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    dot: 'bg-slate-600'
};

const getItemStats = (receipt) => {
    const items = Array.isArray(receipt?.items) ? receipt.items : [];
    const totalPieces = items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);

    const uniqueProducts = new Set(
        items.map((item) => String(item?.productId || item?.productName || item?.variantSku || ''))
    );
    const productCount = Array.from(uniqueProducts).filter(Boolean).length || items.length;

    const uniqueVariants = new Set(
        items.map((item) => String(item?.variantSku || item?.variantLabel || `${item?.productName || ''}-${item?.quantity || ''}`))
    );
    const variantCount = Array.from(uniqueVariants).filter(Boolean).length || items.length;

    return { totalPieces, productCount, variantCount };
};

const formatDate = (dateVal) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

const extractId = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'object') return String(val._id || val.id || val.branchId || '').trim();
    return String(val).trim();
};

const normalizeManager = (mgr) => {
    if (!mgr || typeof mgr !== 'object') return null;
    if (!mgr.name && !mgr.email && !mgr.image) return null;
    return {
        name: mgr.name || '',
        email: mgr.email || '',
        image: mgr.image || ''
    };
};

async function loadBranchesFromApi() {
    const fetcher = getAllBranches;

    if (typeof fetcher !== 'function') return [];

    const res = await fetcher();
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.branches)) return res.branches;
    return [];
}

export default function ReceiptsPage() {
    const { data: session, isPending: sessionPending } = useSession();
    const role = String(session?.user?.role || '').toLowerCase();
    const isTopRole = TOP_ROLES.has(role);
    const userBranchId = extractId(session?.user?.branchId);

    const [receipts, setReceipts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [branchManager, setBranchManager] = useState(null);

    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [autoPrint, setAutoPrint] = useState(false);

    useEffect(() => {
        if (sessionPending) return;

        let active = true;

        Promise.resolve().then(async () => {
            if (!active) return;
            setLoading(true);

            try {
                const [res, branchList] = await Promise.all([
                    getAllReceipts(isTopRole ? '' : userBranchId),
                    isTopRole ? loadBranchesFromApi().catch(() => []) : Promise.resolve([])
                ]);
                if (!active) return;

                const list = res?.success && Array.isArray(res.data) ? res.data : [];
                setReceipts(list);
                setBranches(branchList);

                if (isTopRole) {
                    setBranchManager(null);
                } else {
                    const targetBranchId = userBranchId || extractId(list[0]?.branchId);
                    const mapObj = res?.branchManagersByBranchId && typeof res.branchManagersByBranchId === 'object'
                        ? res.branchManagersByBranchId
                        : {};

                    const resolvedManager =
                        normalizeManager(list[0]?.branchManager) ||
                        normalizeManager(targetBranchId ? mapObj[targetBranchId] : null) ||
                        normalizeManager(Object.values(mapObj)[0]);

                    setBranchManager(resolvedManager);
                }
            } catch (err) {
                console.error('Error loading receipts:', err);
                if (active) {
                    setReceipts([]);
                    setBranches([]);
                    setBranchManager(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        });

        return () => {
            active = false;
        };
    }, [sessionPending, isTopRole, userBranchId]);

    const branchStyleMap = useMemo(() => {
        const orderedIds = [];
        const nameById = new Map();
        const seen = new Set();

        for (const b of branches) {
            const id = extractId(b?._id || b?.id || b?.branchId);
            if (id && !seen.has(id)) {
                seen.add(id);
                orderedIds.push(id);
                nameById.set(id, b?.name || b?.branchName || 'Branch');
            }
        }

        for (const r of receipts) {
            const id = extractId(r?.branchId);
            if (id && !seen.has(id)) {
                seen.add(id);
                orderedIds.push(id);
            }
            if (id && r?.branchName && !nameById.has(id)) {
                nameById.set(id, r.branchName);
            }
        }

        const map = new Map();
        orderedIds.forEach((id, index) => {
            map.set(id, {
                name: nameById.get(id) || 'Branch',
                theme: BRANCH_COLOR_THEMES[index % BRANCH_COLOR_THEMES.length]
            });
        });

        return { map, totalAvailableBranches: branches.length || orderedIds.length };
    }, [branches, receipts]);

    const getBranchMeta = (receipt) => {
        const id = extractId(receipt?.branchId);
        const entry = id ? branchStyleMap.map.get(id) : null;
        return {
            name: receipt?.branchName || entry?.name || 'Branch',
            theme: entry?.theme || DEFAULT_BRANCH_THEME
        };
    };

    const handleOpenModal = (receipt, shouldPrint = false) => {
        setSelectedReceipt(receipt);
        setSelectedReceiptId(String(receipt?._id || receipt?.receiptNumber || ''));
        setAutoPrint(shouldPrint);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setAutoPrint(false);
    };

    const totalRevenue = receipts.reduce((sum, r) => sum + Number(r?.totalBill || 0), 0);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Money Receipts</h1>
                        <p className="text-sm text-gray-500">
                            {isTopRole
                                ? 'All-branch sales receipts across the store network.'
                                : 'View completed checkouts, inspect item details, or download receipt PDFs.'}
                        </p>
                    </div>

                    {isTopRole ? (
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3 bg-emerald-50/70 border border-emerald-100 rounded-xl px-4 py-2.5 w-fit text-xs">
                                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 uppercase tracking-wide">
                                    <FiLayers size={14} /> {role || 'Top Role'} • All Branches
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="font-semibold text-gray-700">
                                    {branchStyleMap.totalAvailableBranches} {branchStyleMap.totalAvailableBranches === 1 ? 'Branch' : 'Branches'}
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="font-bold text-gray-900">
                                    {receipts.length} {receipts.length === 1 ? 'Receipt' : 'Receipts'} (৳{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                </span>
                            </div>

                            {branchStyleMap.map.size > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {Array.from(branchStyleMap.map.entries()).map(([id, info]) => (
                                        <span
                                            key={id}
                                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${info.theme.badge}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${info.theme.dot}`} />
                                            {info.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : branchManager && (
                        <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-2.5 w-fit">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 border border-white">
                                {branchManager.image ? (
                                    <Image
                                        src={branchManager.image}
                                        alt={branchManager.name || 'Branch Manager'}
                                        width={40}
                                        height={40}
                                        unoptimized
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{branchManager.name?.charAt(0) || 'M'}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                                    Branch Manager
                                </p>
                                <p className="text-xs font-bold text-gray-900 truncate">
                                    {branchManager.name || '—'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {branchManager.email || '—'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {role === 'cashier' && (
                    <Link href="/dashboard/pos" className="shrink-0">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-6 shadow-md shadow-emerald-600/20">
                            <FiPlusCircle size={18} className="mr-1.5" /> Go to POS
                        </Button>
                    </Link>
                )}
            </div>

            {loading ? (
                <Card className="p-12 text-center border border-gray-200 rounded-2xl bg-white text-sm text-gray-500">
                    Loading receipts...
                </Card>
            ) : receipts.length === 0 ? (
                <Card className="p-12 text-center border border-gray-200 rounded-2xl bg-white space-y-2">
                    <FiFileText size={36} className="mx-auto text-gray-300" />
                    <p className="font-semibold text-gray-700">No receipts found</p>
                    <p className="text-xs text-gray-400">Completed POS checkouts will appear here.</p>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                        {receipts.map((receipt) => {
                            const { totalPieces, productCount, variantCount } = getItemStats(receipt);
                            const customerName = receipt?.customer?.name || 'Walk-in Customer';
                            const customerContact = receipt?.customer?.phone || receipt?.customer?.email || '';
                            const branchMeta = getBranchMeta(receipt);

                            return (
                                <div
                                    key={String(receipt._id || receipt.receiptNumber)}
                                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4"
                                >
                                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                                        <div>
                                            <p className="text-xs font-mono font-bold text-emerald-700">
                                                {receipt.receiptNumber}
                                            </p>
                                            {isTopRole && (
                                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${branchMeta.theme.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${branchMeta.theme.dot}`} />
                                                    {branchMeta.name}
                                                </span>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(receipt.createdAt)}
                                            </p>
                                        </div>
                                        <p className="text-base font-extrabold text-gray-900">
                                            ৳{Number(receipt.totalBill || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="bg-gray-50 p-3 rounded-xl space-y-0.5">
                                            <p className="text-[11px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                                                <FiUser size={12} /> Customer Info
                                            </p>
                                            <p className="font-bold text-gray-800">{customerName}</p>
                                            {customerContact && <p className="text-gray-500 truncate">{customerContact}</p>}
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-xl space-y-0.5">
                                            <p className="text-[11px] font-semibold text-gray-400 uppercase">Cashier Info</p>
                                            <p className="font-bold text-gray-800">{receipt.cashierName || 'Cashier'}</p>
                                            {receipt.cashierEmail && <p className="text-gray-500 truncate">{receipt.cashierEmail}</p>}
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3 text-xs flex items-center justify-between">
                                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                                            <FiShoppingBag size={14} className="text-emerald-600" /> Total Items Bought
                                        </span>
                                        <span className="font-bold text-emerald-800">
                                            {totalPieces} pcs ({productCount} {productCount === 1 ? 'product' : 'products'} • {variantCount} {variantCount === 1 ? 'variant' : 'variants'})
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            onPress={() => handleOpenModal(receipt, false)}
                                            className="flex-1 border-emerald-300 text-emerald-800 font-semibold"
                                        >
                                            <FiEye size={14} className="mr-1" /> View
                                        </Button>
                                        <Button
                                            size="sm"
                                            onPress={() => handleOpenModal(receipt, true)}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                        >
                                            <FiDownload size={14} className="mr-1" /> Download PDF
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                        <th className="py-3.5 px-4">Date</th>
                                        {isTopRole && <th className="py-3.5 px-4">Branch</th>}
                                        <th className="py-3.5 px-4">Total Cost</th>
                                        <th className="py-3.5 px-4">Customer Info</th>
                                        <th className="py-3.5 px-4">Cashier Info</th>
                                        <th className="py-3.5 px-4">Total Items Bought</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {receipts.map((receipt) => {
                                        const { totalPieces, productCount, variantCount } = getItemStats(receipt);
                                        const customerName = receipt?.customer?.name || 'Walk-in Customer';
                                        const customerContact = receipt?.customer?.phone || receipt?.customer?.email || '';
                                        const branchMeta = getBranchMeta(receipt);

                                        return (
                                            <tr key={String(receipt._id || receipt.receiptNumber)} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <p className="text-xs font-mono font-bold text-emerald-700">{receipt.receiptNumber}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{formatDate(receipt.createdAt)}</p>
                                                </td>

                                                {isTopRole && (
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${branchMeta.theme.badge}`}>
                                                            <span className={`w-2 h-2 rounded-full ${branchMeta.theme.dot}`} />
                                                            {branchMeta.name}
                                                        </span>
                                                    </td>
                                                )}

                                                <td className="py-3.5 px-4 whitespace-nowrap font-extrabold text-gray-900">
                                                    ৳{Number(receipt.totalBill || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <p className="text-xs font-bold text-gray-900">{customerName}</p>
                                                    {customerContact && (
                                                        <p className="text-xs text-gray-500">{customerContact}</p>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <p className="text-xs font-bold text-gray-900">{receipt.cashierName || 'Cashier'}</p>
                                                    {receipt.cashierEmail && (
                                                        <p className="text-xs text-gray-500">{receipt.cashierEmail}</p>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <p className="text-xs font-bold text-gray-900">{totalPieces} pcs</p>
                                                    <p className="text-xs text-gray-500">
                                                        {productCount} {productCount === 1 ? 'product' : 'products'} • {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
                                                    </p>
                                                </td>

                                                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="bordered"
                                                            onPress={() => handleOpenModal(receipt, false)}
                                                            className="border-emerald-300 text-emerald-800 font-semibold"
                                                        >
                                                            <FiEye size={14} className="mr-1" /> View
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onPress={() => handleOpenModal(receipt, true)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                                        >
                                                            <FiDownload size={14} className="mr-1" /> Download PDF
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <ReceiptViewModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                receiptId={selectedReceiptId}
                initialReceipt={selectedReceipt}
                autoPrint={autoPrint}
            />
        </div>
    );
}