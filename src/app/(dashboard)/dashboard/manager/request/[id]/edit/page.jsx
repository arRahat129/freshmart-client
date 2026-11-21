'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Input, TextArea, Button, Spinner } from '@heroui/react';
import { FiArrowLeft, FiLayers } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { getBranchStockDemandById, getBranchCustomProductRequestById } from '@/lib/api/branchCustomProduct';
import { actionUpdateBranchStockDemand, actionUpdateBranchCustomProductRequest } from '@/lib/actions/branchCustomProduct';
import UpdateRequestModal from '@/component/dashboard/manager/modals/UpdateRequestModal';
import { useRoleGuard } from '@/lib/useRoleGuard';

export default function EditRequestPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const requestType = searchParams.get('type') || 'standard';

    const { allowed } = useRoleGuard(['manager']);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const [form, setForm] = useState({
        productName: '',
        managerNote: '',
        variants: []
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = requestType === 'custom'
                    ? await getBranchCustomProductRequestById(id)
                    : await getBranchStockDemandById(id);

                if (res.success && res.data) {
                    const data = res.data;
                    const loadedVariants = (data.requestedVariants || data.variants || []).map(v => ({
                        variantSku: v.variantSku,
                        quantity: v.quantity || v.requestedStock || 1,
                        attributes: Array.isArray(v.attributes) && v.attributes.length > 0
                            ? v.attributes
                            : []
                    }));

                    setForm({
                        productName: data.productName || '',
                        managerNote: data.managerNote || '',
                        variants: loadedVariants
                    });
                } else {
                    toast.error('Failed to load request details');
                }
            } catch (err) {
                toast.error('Error fetching request details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id, requestType]);

    const handleVariantChange = (index, field, value) => {
        setForm(prev => {
            const updated = [...prev.variants];
            updated[index] = {
                ...updated[index],
                [field]: value
            };
            return { ...prev, variants: updated };
        });
    };

    const handleConfirmUpdate = async () => {
        setSubmitting(true);
        try {
            let res;
            if (requestType === 'standard') {
                const payload = {
                    managerNote: form.managerNote,
                    requestedVariants: form.variants.map(v => ({
                        variantSku: v.variantSku,
                        quantity: Number(v.quantity)
                    }))
                };
                res = await actionUpdateBranchStockDemand(id, payload);
            } else {
                const payload = {
                    productName: form.productName,
                    managerNote: form.managerNote,
                    variants: form.variants.map(v => ({
                        variantSku: v.variantSku,
                        requestedStock: Number(v.quantity)
                    }))
                };
                res = await actionUpdateBranchCustomProductRequest(id, payload);
            }

            if (res.success) {
                toast.success('Request updated successfully');
                router.push('/dashboard/manager/request');
            } else {
                toast.error(res.message || 'Failed to update request');
            }
        } catch (err) {
            toast.error('An error occurred while updating');
        } finally {
            setSubmitting(false);
            setIsConfirmOpen(false);
        }
    };

    if (!allowed) return null;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Spinner size="lg" label="Loading request details..." />
            </div>
        );
    }

    const isCustom = requestType === 'custom';

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Toaster position="top-right" />

            <div className="flex items-center gap-3">
                <Button isIconOnly variant="light" onPress={() => router.back()} aria-label="Go back">
                    <FiArrowLeft className="text-xl" />
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            {isCustom ? 'Custom Branch Product' : 'Main Warehouse Restock'}
                        </span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mt-0.5">
                        {isCustom ? 'Edit Custom Product Request' : 'Edit Stock Restock Request'}
                    </h1>
                    <p className="text-xs text-default-500">
                        Modify variant quantities, specifications, or notes prior to administrative review.
                    </p>
                </div>
            </div>

            <Card className="p-6 shadow-sm border border-default-100 space-y-6 bg-white">
                {isCustom && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Product Name</label>
                        <Input
                            placeholder="Enter custom product name"
                            value={form.productName}
                            onChange={(e) => setForm({ ...form, productName: e.target.value })}
                            variant="bordered"
                            isRequired
                        />
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-default-100 pb-2">
                        <FiLayers className="text-emerald-600" />
                        <h3 className="text-sm font-bold text-gray-800">Requested Variants & Quantities</h3>
                    </div>

                    <div className="space-y-3">
                        {form.variants.map((variant, index) => (
                            <div
                                key={index}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 bg-default-50 p-4 rounded-xl border border-default-200/60"
                            >
                                <div className="flex-1 space-y-1.5">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Variant</p>
                                    <p className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block">
                                        {variant.variantSku}
                                    </p>
                                    {Array.isArray(variant.attributes) && variant.attributes.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {variant.attributes.map((attr, aIdx) => (
                                                <span key={aIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                                                    <span className="font-semibold text-gray-500">{attr.attributeType}:</span>
                                                    {attr.attributeValue}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="w-full sm:w-48 shrink-0">
                                    <Input
                                        size="sm"
                                        type="number"
                                        min="1"
                                        label="Requested Quantity"
                                        placeholder="Enter quantity"
                                        value={variant.quantity}
                                        onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                        variant="bordered"
                                        isRequired
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-gray-700">Manager Note / Instructions</label>
                    <TextArea
                        placeholder="Provide any additional context, reason for restock, or delivery instructions..."
                        value={form.managerNote}
                        onChange={(e) => setForm({ ...form, managerNote: e.target.value })}
                        variant="bordered"
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-default-100">
                    <Button variant="flat" color="default" onPress={() => router.back()}>
                        Cancel
                    </Button>
                    <Button color="success" className="bg-emerald-600 text-white font-semibold" onPress={() => setIsConfirmOpen(true)}>
                        Save Changes
                    </Button>
                </div>
            </Card>

            <UpdateRequestModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmUpdate}
                isLoading={submitting}
            />
        </div>
    );
}