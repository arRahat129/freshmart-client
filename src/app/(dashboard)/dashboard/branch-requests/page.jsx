'use client';

import React, { useEffect, useState, useCallback, startTransition } from 'react';
import Image from 'next/image';
import {
    Card,
    CardFooter,
    Button,
    Chip,
    Spinner
} from '@heroui/react';
import {
    FiCheck,
    FiX,
    FiLayers,
    FiMapPin,
    FiUser,
    FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
    getAllBranchStockDemands,
    getAllBranchCustomProductRequests
} from '@/lib/api/branchCustomProduct';
import {
    actionReviewStockDemand,
    actionReviewBranchCustomProductRequest,
    actionDeleteBranchStockDemand,
    actionDeleteBranchCustomProductRequest
} from '@/lib/actions/branchCustomProduct';
import { useSession } from '@/lib/auth-client';
import AcceptRequestModal from '@/component/dashboard/branch-requests/AcceptRequestModal';
import RejectRequestModal from '@/component/dashboard/branch-requests/RejectRequestModal';
import DeleteRequestModal from '@/component/dashboard/branch-requests/DeleteRequestModal';

export default function AdminBranchRequestsPage() {
    const { data: session, isPending } = useSession();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const [deleteAfterReject, setDeleteAfterReject] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAllRequests = useCallback(async () => {
        try {
            setLoading(true);
            const [demandsRes, customRes] = await Promise.all([
                getAllBranchStockDemands(),
                getAllBranchCustomProductRequests()
            ]);

            const demands = (demandsRes?.data || []).map(r => ({ ...r, type: 'standard' }));
            const customs = (customRes?.data || []).map(r => ({ ...r, type: 'custom' }));
            const combined = [...demands, ...customs].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            startTransition(() => {
                setRequests(combined);
                setLoading(false);
            });
        } catch (err) {
            console.error('Error loading requests:', err);
            toast.error('Failed to load branch requests');
            startTransition(() => {
                setLoading(false);
            });
        }
    }, []);

    useEffect(() => {
        if (!isPending) {
            fetchAllRequests();
        }
    }, [isPending, fetchAllRequests]);

    const reviewerId = String(session?.user?.id || session?.user?._id || '');
    const reviewerName = session?.user?.name || 'Admin';

    const openAcceptModal = (req) => {
        setSelectedRequest(req);
        setIsAcceptOpen(true);
    };

    const handleConfirmAccept = async () => {
        if (!selectedRequest) return;
        setActionLoading(true);

        try {
            const payload = {
                status: 'Approved',
                reviewedBy: reviewerId,
                reviewedByName: reviewerName,
                adminNote: 'Accepted'
            };

            const res = selectedRequest.type === 'custom'
                ? await actionReviewBranchCustomProductRequest(selectedRequest._id, payload)
                : await actionReviewStockDemand(selectedRequest._id, payload);

            if (res.success) {
                toast.success('Request accepted! Main warehouse stock updated.');
                setIsAcceptOpen(false);
                await fetchAllRequests();
            } else {
                toast.error(res.message || 'Failed to accept request');
            }
        } catch (error) {
            toast.error('An error occurred while accepting request');
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectModal = (req, shouldDelete = false) => {
        setSelectedRequest(req);
        setDeleteAfterReject(shouldDelete);
        setRejectionReason('');
        setIsRejectOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!selectedRequest || actionLoading) return;
        if (!rejectionReason.trim()) {
            toast.error('Please enter a reason for rejecting this request.');
            return;
        }

        const targetId = selectedRequest._id;
        const targetType = selectedRequest.type;
        setActionLoading(true);

        try {
            if (deleteAfterReject) {
                const deletePayload = {
                    reviewedBy: reviewerId,
                    reviewedByName: reviewerName,
                    adminNote: rejectionReason.trim(),
                    isAdminDelete: true
                };

                const res = targetType === 'custom'
                    ? await actionDeleteBrpZEAWYtiB6bJ16NuLbGCc6CZ6jJdKfb63(targetId, deletePayload)
                    : await actionDeleteBranchStockDemand(targetId, deletePayload);

                setIsRejectOpen(false);
                setSelectedRequest(null);
                setRequests(prev => prev.filter(r => r._id !== targetId));

                if (res.success) {
                    toast.success('Rejection logged and request removed.');
                } else {
                    toast.error(res.message || 'Request already removed');
                }
            } else {
                const rejectPayload = {
                    status: 'Rejected',
                    reviewedBy: reviewerId,
                    reviewedByName: reviewerName,
                    adminNote: rejectionReason.trim()
                };

                const res = targetType === 'custom'
                    ? await actionReviewBrpZEAWYtiB6bJ16NuLbGCc6CZ6jJdKfb63(targetId, rejectPayload)
                    : await actionReviewStockDemand(targetId, rejectPayload);

                if (res.success) {
                    toast.success('Request rejected and reason recorded.');
                    setIsRejectOpen(false);
                    setSelectedRequest(null);
                    await fetchAllRequests();
                } else {
                    toast.error(res.message || 'Failed to reject request');
                }
            }
        } catch (error) {
            toast.error('An error occurred while processing rejection');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDirectDelete = async () => {
        if (!selectedRequest || actionLoading) return;
        const targetId = selectedRequest._id;
        const targetType = selectedRequest.type;
        setActionLoading(true);

        try {
            const res = targetType === 'custom'
                ? await actionDeleteBrpZEAWYtiB6bJ16NuLbGCc6CZ6jJdKfb63(targetId)
                : await actionDeleteBranchStockDemand(targetId);

            setIsDeleteConfirmOpen(false);
            setSelectedRequest(null);
            setRequests(prev => prev.filter(r => r._id !== targetId));

            if (res.success) {
                toast.success('Request entry deleted.');
            } else {
                toast.error(res.message || 'Entry already removed');
            }
        } catch (error) {
            toast.error('Error deleting entry');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCrossClick = (req) => {
        if (req.status === 'Pending') {
            openRejectModal(req, true);
        } else {
            setSelectedRequest(req);
            setIsDeleteConfirmOpen(true);
        }
    };

    const getStatusChip = (statusVal) => {
        if (statusVal === 'Approved') {
            return <Chip color="success" size="sm" variant="flat" className="font-semibold">Accepted</Chip>;
        }
        if (statusVal === 'Rejected') {
            return <Chip color="danger" size="sm" variant="flat" className="font-semibold">Rejected</Chip>;
        }
        return <Chip color="warning" size="sm" variant="flat" className="font-semibold">Pending</Chip>;
    };

    const filteredRequests = filterStatus === 'All'
        ? requests
        : requests.filter(r => r.status === filterStatus);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Branch Stock & Product Requests</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Review, accept, or reject branch inventory restocks and custom product submissions.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'All', value: 'All' },
                        { label: 'Pending', value: 'Pending' },
                        { label: 'Accepted', value: 'Approved' },
                        { label: 'Rejected', value: 'Rejected' }
                    ].map((tab) => (
                        <Button
                            key={tab.value}
                            size="sm"
                            variant={filterStatus === tab.value ? 'solid' : 'flat'}
                            color={filterStatus === tab.value ? 'success' : 'default'}
                            className={filterStatus === tab.value ? 'bg-emerald-600 text-white font-semibold' : 'font-medium'}
                            onPress={() => setFilterStatus(tab.value)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {loading || isPending ? (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" label="Loading branch requests..." />
                </div>
            ) : filteredRequests.length === 0 ? (
                <Card className="text-center py-16 border-dashed border-2 border-gray-200 shadow-none bg-white">
                    <div className="flex flex-col items-center gap-3">
                        <FiPackage className="text-4xl text-gray-400" />
                        <p className="text-gray-500 text-sm">No requests found in this category.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((req) => {
                        const variantsList = req.requestedVariants || req.variants || [];
                        const totalUnits = variantsList.reduce(
                            (sum, v) => sum + Number(v.quantity || v.requestedStock || 0),
                            0
                        );
                        const productName = req.productName || (req.type === 'custom' ? 'Custom Product' : 'Warehouse Product');
                        const primaryImage = req.images?.[0];

                        return (
                            <Card
                                key={req._id}
                                className="relative shadow-sm border border-gray-200/80 hover:shadow-md transition-all flex flex-col justify-between bg-white rounded-2xl overflow-hidden"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleCrossClick(req)}
                                    title={req.status === 'Pending' ? 'Reject & Delete Request' : 'Delete Entry'}
                                    className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                                >
                                    <FiX size={15} />
                                </button>

                                <div>
                                    <div className="flex items-center gap-3 p-4 pr-11 border-b border-gray-100 bg-gray-50/60">
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0">
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
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                                    {req.type === 'custom' ? 'Custom Entry' : 'Restock'}
                                                </span>
                                                {getStatusChip(req.status)}
                                            </div>
                                            <h3 className="font-bold text-sm text-gray-900 truncate" title={productName}>
                                                {productName}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3 text-xs text-gray-600">
                                        <div className="bg-gray-50 rounded-xl p-2.5 space-y-1.5 border border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <FiMapPin className="text-emerald-600 shrink-0" />
                                                <span className="truncate">{req.branchName || 'Assigned Branch'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FiUser className="text-gray-400 shrink-0" />
                                                <span className="truncate">
                                                    {req.requestedBy || req.managerName} ({req.employeeId || 'Manager'})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between font-semibold text-gray-700">
                                                <span className="flex items-center gap-1.5">
                                                    <FiLayers className="text-emerald-600" />
                                                    Requested Variants ({variantsList.length})
                                                </span>
                                                <span className="text-emerald-700 font-bold">{totalUnits} Total Units</span>
                                            </div>

                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                {variantsList.map((v, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-gray-50/80 p-2 rounded-lg border border-gray-200/60 flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <span className="font-mono font-bold text-emerald-800 text-[11px] block">
                                                                {v.variantSku}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500">
                                                                {v.size} • {v.color}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                                                            {v.quantity || v.requestedStock} pcs
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {req.managerNote && (
                                            <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-2 text-[11px] text-amber-900">
                                                <span className="font-bold">Manager Note: </span>
                                                {req.managerNote}
                                            </div>
                                        )}

                                        {req.status === 'Rejected' && req.adminNote && (
                                            <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-[11px] text-red-800">
                                                <span className="font-bold">Rejection Reason: </span>
                                                {req.adminNote}
                                            </div>
                                        )}

                                        {req.status !== 'Pending' && req.reviewedByName && (
                                            <div className="text-[11px] text-gray-400 flex justify-between pt-1">
                                                <span>Reviewed by: <strong className="text-gray-600">{req.reviewedByName}</strong></span>
                                                <span>{new Date(req.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {req.status === 'Pending' && (
                                    <CardFooter className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 grid grid-cols-2 gap-2">
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            startContent={<FiX />}
                                            className="font-semibold"
                                            onPress={() => openRejectModal(req, false)}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="success"
                                            startContent={<FiCheck />}
                                            className="bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                                            onPress={() => openAcceptModal(req)}
                                        >
                                            Accept
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            <AcceptRequestModal
                isOpen={isAcceptOpen}
                onOpenChange={setIsAcceptOpen}
                request={selectedRequest}
                isLoading={actionLoading}
                onConfirm={handleConfirmAccept}
            />

            <RejectRequestModal
                isOpen={isRejectOpen}
                onOpenChange={setIsRejectOpen}
                request={selectedRequest}
                reason={rejectionReason}
                onReasonChange={setRejectionReason}
                deleteAfterReject={deleteAfterReject}
                isLoading={actionLoading}
                onConfirm={handleConfirmReject}
            />

            <DeleteRequestModal
                isOpen={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                request={selectedRequest}
                isLoading={actionLoading}
                onConfirm={handleDirectDelete}
            />
        </div>
    );
}