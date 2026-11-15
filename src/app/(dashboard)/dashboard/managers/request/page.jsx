'use client';

import React, { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardFooter, Button, Chip, Spinner } from '@heroui/react';
import { FiPlus, FiEye, FiEdit3, FiTrash2, FiBox, FiLayers } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { getAllBranchStockDemands, getAllBranchCustomProductRequests } from '@/lib/api/branchCustomProduct';
import { actionDeleteBranchStockDemand, actionDeleteBranchCustomProductRequest } from '@/lib/actions/branchCustomProduct';
import ViewRequestModal from '@/component/dashboard/manager/modals/ViewRequestModal';
import DeleteRequestAlert from '@/component/dashboard/manager/alert/DeleteRequestAlert';
import { useSession } from '@/lib/auth-client';

const FALLBACK_IMAGE = "https://i.ibb.co.com/JwgTBWgB/freshmart-logo.jpg";

export default function ManagerRequestsPage() {
    const { data: session, isPending } = useSession();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isPending) return;

        let isMounted = true;

        async function fetchRequests() {
            try {
                const branchId = session?.user?.branchId;
                const branchIdStr = branchId ? (typeof branchId === 'object' ? branchId.toString() : branchId) : '';

                const [demandsRes, customRes] = await Promise.all([
                    getAllBranchStockDemands(branchIdStr),
                    getAllBranchCustomProductRequests(branchIdStr)
                ]);

                if (!isMounted) return;

                const demands = (demandsRes?.data || []).map(r => ({ ...r, type: 'standard' }));
                const customs = (customRes?.data || []).map(r => ({ ...r, type: 'custom' }));
                const combined = [...demands, ...customs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                startTransition(() => {
                    setRequests(combined);
                    setLoading(false);
                });
            } catch (err) {
                if (!isMounted) return;
                console.error('Failed to load requests:', err);
                toast.error('Failed to load stock requests');
                startTransition(() => {
                    setLoading(false);
                });
            }
        }

        fetchRequests();

        return () => {
            isMounted = false;
        };
    }, [isPending, session]);

    const handleDelete = async () => {
        if (!selectedRequest) return;
        setIsDeleting(true);
        try {
            const res = selectedRequest.type === 'custom'
                ? await actionDeleteBranchCustomProductRequest(selectedRequest._id)
                : await actionDeleteBranchStockDemand(selectedRequest._id);

            if (res.success) {
                toast.success('Request deleted successfully');
                setRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
                setIsDeleteOpen(false);
            } else {
                toast.error(res.message || 'Failed to delete request');
            }
        } catch (err) {
            toast.error('Error deleting request');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusChip = (statusVal) => {
        const colorMap = { Pending: 'warning', Approved: 'success', Rejected: 'danger' };
        return <Chip color={colorMap[statusVal] || 'default'} size="sm" variant="flat">{statusVal}</Chip>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Toaster position="top-right" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">Branch Stock Requests</h1>
                    <p className="text-small text-default-500">Track and manage inventory requests submitted for your branch</p>
                </div>
                <Link href="/dashboard/managers/request/create">
                    <Button
                        color="primary"
                        endContent={<FiPlus />}
                        className="font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        Request Stock
                    </Button>
                </Link>
            </div>

            {loading || isPending ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" label="Loading branch requests..." />
                </div>
            ) : requests.length === 0 ? (
                <Card className="text-center py-12 border-dashed border-2 border-default-200 shadow-none">
                    <div className="flex flex-col items-center gap-3">
                        <FiBox className="text-4xl text-default-400" />
                        <p className="text-default-500 text-small">No stock requests found for this branch.</p>
                        <Link href="/dashboard/managers/request/create">
                            <Button size="sm" color="primary" variant="flat">
                                Create First Request
                            </Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {requests.map((req) => {
                        const variantsList = req.requestedVariants || req.variants || [];
                        const totalDemanded = variantsList.reduce((acc, v) => acc + Number(v.quantity || v.requestedStock || 0), 0);

                        const productName = req.productName || req.productDetails?.name || req.product?.name || req.productId?.name || (req.type === 'custom' ? 'Custom Product Request' : 'Main Warehouse Product');
                        const primaryImage = req.images?.[0] || req.productDetails?.images?.[0] || req.product?.images?.[0] || req.productId?.images?.[0] || FALLBACK_IMAGE;

                        return (
                            <Card key={req._id} className="shadow-sm border border-default-100 hover:shadow-md transition-shadow flex flex-col justify-between bg-white rounded-2xl overflow-hidden">
                                <div>
                                    <div className="flex items-center gap-3 p-4 border-b border-default-100 bg-default-50/50">
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-default-200 bg-white shrink-0">
                                            <Image
                                                src={primaryImage}
                                                alt={productName}
                                                fill
                                                sizes="56px"
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                                    {req.type === 'custom' ? 'Custom Entry' : 'Warehouse'}
                                                </span>
                                                {getStatusChip(req.status)}
                                            </div>
                                            <h3 className="font-bold text-sm text-default-900 truncate" title={productName}>
                                                {productName}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3 text-xs text-default-600">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 font-semibold text-default-700">
                                                <FiLayers size={14} className="text-emerald-600" />
                                                <span>Requested Variants ({variantsList.length})</span>
                                            </div>
                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                {variantsList.map((v, vIdx) => (
                                                    <div key={vIdx} className="bg-default-50 p-2.5 rounded-xl border border-default-200/60 space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                                                                {v.variantSku || 'N/A'}
                                                            </span>
                                                            <span className="font-bold text-default-900">
                                                                Qty: {v.quantity || v.requestedStock || 0} pcs
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px] text-default-500 pt-0.5 border-t border-default-200/40">
                                                            <span>Size: {v.size || 'Standard'} | Color: {v.color || 'Default'}</span>
                                                            {v.pricePerPiece !== undefined && (
                                                                <span className="font-semibold text-emerald-700">
                                                                    Price: ${v.pricePerPiece}/pc
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-default-100 flex justify-between items-center font-medium">
                                            <span className="text-default-500">Total Demanded:</span>
                                            <span className="font-bold text-default-900 text-sm">{totalDemanded} Units</span>
                                        </div>

                                        <div className="flex justify-between items-center text-[11px] text-default-400">
                                            <span>Requested Date:</span>
                                            <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <CardFooter className="px-4 py-3 border-t border-default-100 bg-default-50/30 flex justify-end gap-1.5">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="default"
                                        onPress={() => { setSelectedRequest(req); setIsViewOpen(true); }}
                                        startContent={<FiEye />}
                                        className="font-medium"
                                    >
                                        View
                                    </Button>
                                    {req.status === 'Pending' && (
                                        <>
                                            <Link href={`/dashboard/managers/request/${req._id}/edit?type=${req.type}`}>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary"
                                                    startContent={<FiEdit3 />}
                                                    className="font-medium"
                                                >
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="danger"
                                                onPress={() => { setSelectedRequest(req); setIsDeleteOpen(true); }}
                                                startContent={<FiTrash2 />}
                                                className="font-medium"
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            <ViewRequestModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} request={selectedRequest} />
            <DeleteRequestAlert isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} isLoading={isDeleting} />
        </div>
    );
}