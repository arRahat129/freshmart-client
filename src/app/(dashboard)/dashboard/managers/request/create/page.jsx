'use client';

import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, TextArea, Button } from '@heroui/react';
import {
    FiArrowLeft,
    FiBox,
    FiPackage,
    FiLayers,
    FiClipboard,
    FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
    actionRequestBranchStock,
    actionRequestBranchCustomProduct
} from '@/lib/actions/branchCustomProduct';
import {
    getAllMainProducts,
    getAllCategories
} from '@/lib/api/product';
import { getBranchById } from '@/lib/api/branch';
import { useSession } from '@/lib/auth-client';

export default function CreateRequestPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    const [requestType, setRequestType] = useState('standard');
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);

    const [branchData, setBranchData] = useState(null);

    const [form, setForm] = useState({
        categoryId: '',
        productId: '',
        productName: '',
        managerNote: '',
        variants: []
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const catRes = await getAllCategories();
                if (catRes?.success) {
                    setCategories(catRes.data || []);
                } else if (Array.isArray(catRes)) {
                    setCategories(catRes);
                }
            } catch (err) {
                console.error('Failed to load categories', err);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (isPending) return;

        const fetchBranchData = async () => {
            try {
                const userBranchId = session?.user?.branchID || session?.user?.branchId;
                if (userBranchId) {
                    const branchIdStr = typeof userBranchId === 'object' && userBranchId !== null
                        ? (userBranchId.toString ? userBranchId.toString() : '')
                        : String(userBranchId);

                    if (branchIdStr) {
                        const branchRes = await getBranchById(branchIdStr);
                        if (branchRes) {
                            const bData = branchRes.data || branchRes;
                            setBranchData(bData);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load branch data', err);
            }
        };

        if (session?.user) {
            fetchBranchData();
        }
    }, [session, isPending]);

    const fetchProductsByCategory = useCallback(async (catId) => {
        try {
            setProductsLoading(true);
            const res = await getAllMainProducts(1, 100);
            if (res && res.success) {
                const allProds = res.data || res.products || [];
                const filtered = allProds.filter(p => {
                    const pCatId = p.categoryId?._id || p.categoryId || p.category;
                    return String(pCatId) === String(catId);
                });
                startTransition(() => {
                    setAvailableProducts(filtered);
                    setProductsLoading(false);
                });
            } else {
                startTransition(() => {
                    setProductsLoading(false);
                });
            }
        } catch (err) {
            console.error('Failed to load products by category', err);
            startTransition(() => {
                setProductsLoading(false);
            });
        }
    }, []);

    const handleCategoryChange = (catId) => {
        startTransition(() => {
            setForm(prev => ({ ...prev, categoryId: catId, productId: '', variants: [] }));
            setAvailableProducts([]);
        });

        if (requestType === 'standard' && catId) {
            fetchProductsByCategory(catId);
        }
    };

    const handleProductSelect = (selectedProductId) => {
        setForm(prev => ({ ...prev, productId: selectedProductId, variants: [] }));
        const selectedProduct = availableProducts.find(
            p => String(p._id || p.id) === String(selectedProductId)
        );

        if (selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0) {
            const mappedVariants = selectedProduct.variants.map(v => {
                const attributes = v.attributes || [];
                const sizeAttr = attributes.find(a => a.attributeType?.toLowerCase().includes('size'));
                const colorAttr = attributes.find(a => a.attributeType?.toLowerCase().includes('color'));

                return {
                    variantSku: v.sku || v.variantSku || '',
                    size: sizeAttr ? sizeAttr.attributeValue : (v.size || 'Standard'),
                    color: colorAttr ? colorAttr.attributeValue : (v.color || 'Default'),
                    attributes: attributes,
                    quantity: 0,
                    availableStock: v.variantStock !== undefined ? v.variantStock : 0,
                    pricePerPiece: v.pricePerPiece || 0
                };
            });

            setForm(prev => ({ ...prev, variants: mappedVariants }));
        } else {
            setForm(prev => ({ ...prev, variants: [] }));
        }
    };

    const handleVariantQuantityChange = (index, qty) => {
        setForm(prev => {
            const updated = [...prev.variants];
            updated[index] = {
                ...updated[index],
                quantity: Math.max(0, Number(qty))
            };
            return { ...prev, variants: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const activeVariants = form.variants.filter(v => Number(v.quantity) > 0);
        if (activeVariants.length === 0) {
            toast.error('Please specify a quantity greater than 0 for at least one variant.');
            return;
        }

        setLoading(true);

        const managerInfo = {
            managerId: String(session?.user?.id || session?.user?._id || ''),
            managerName: session?.user?.name || '',
            managerEmail: session?.user?.email || '',
            employeeId: session?.user?.employeeId || ''
        };

        try {
            let res;

            if (requestType === 'standard') {
                const payload = {
                    ...managerInfo,
                    productId: form.productId,
                    managerNote: form.managerNote,
                    requestedVariants: activeVariants.map(v => ({
                        variantSku: v.variantSku,
                        size: v.size,
                        color: v.color,
                        quantity: Number(v.quantity)
                    }))
                };

                res = await actionRequestBranchStock(payload);
            } else {
                const payload = {
                    ...managerInfo,
                    productName: form.productName,
                    categoryId: form.categoryId,
                    managerNote: form.managerNote,
                    variants: activeVariants.map(v => ({
                        variantSku: v.variantSku,
                        size: v.size,
                        color: v.color,
                        requestedStock: Number(v.quantity),
                        pricePerPiece: v.pricePerPiece
                    }))
                };

                res = await actionRequestBranchCustomProduct(payload);
            }

            if (res.success) {
                toast.success('Request submitted successfully');
                router.push('/dashboard/managers/request');
            } else {
                toast.error(res.message || 'Failed to submit request');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const totalQuantity = form.variants.reduce(
        (total, variant) => total + (Number(variant.quantity) || 0),
        0
    );

    return (
        <div className="min-h-screen bg-[#f5f9f6] dark:bg-[#101a15] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-4 border-b border-emerald-100 dark:border-emerald-900/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Button
                            isIconOnly
                            variant="flat"
                            onPress={() => router.back()}
                            className="mt-1 min-w-10 bg-white text-emerald-700 shadow-sm dark:bg-[#1c2b22] dark:text-emerald-400"
                            title="Go Back"
                        >
                            <FiArrowLeft className="text-lg" />
                        </Button>

                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                    Inventory Management {branchData ? `• ${branchData.name || 'Branch'}` : ''}
                                </span>
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                                Create Stock Request
                            </h1>

                            <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500 dark:text-gray-400 sm:text-sm">
                                Request inventory replenishment or register a new branch-exclusive product.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start rounded-lg border border-emerald-100 bg-white px-3 py-2 dark:border-emerald-900/40 dark:bg-[#1c2b22] sm:self-center">
                        <FiClipboard className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {session?.user?.name ? `Mgr: ${session.user.name}` : 'New Request'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => {
                            setRequestType('standard');
                            if (form.categoryId) {
                                fetchProductsByCategory(form.categoryId);
                            }
                        }}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${requestType === 'standard'
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/30'
                            : 'border-gray-200 bg-white hover:border-emerald-300 dark:border-gray-800 dark:bg-[#19251e]'
                            }`}
                    >
                        <div className={`rounded-lg p-3 ${requestType === 'standard' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                            <FiPackage className="text-xl" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Main Warehouse Restock</h3>
                                {requestType === 'standard' && <FiCheckCircle className="shrink-0 text-emerald-600" />}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">Request additional stock for an existing warehouse product.</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setRequestType('custom');
                            startTransition(() => {
                                setAvailableProducts([]);
                            });
                        }}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${requestType === 'custom'
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/30'
                            : 'border-gray-200 bg-white hover:border-emerald-300 dark:border-gray-800 dark:bg-[#19251e]'
                            }`}
                    >
                        <div className={`rounded-lg p-3 ${requestType === 'custom' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                            <FiLayers className="text-xl" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Custom Branch Product</h3>
                                {requestType === 'custom' && <FiCheckCircle className="shrink-0 text-emerald-600" />}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">Request approval to introduce a new branch-exclusive product.</p>
                        </div>
                    </button>
                </div>

                <Card className="overflow-visible rounded-xl border border-emerald-100 bg-white shadow-sm dark:border-emerald-900/40 dark:bg-[#19251e]">
                    <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6 lg:p-8">
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/40">
                                    <FiBox className="text-emerald-700 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">1. Select Category & Product</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">First select category, then choose the product to view all its variants.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category</label>
                                    <select
                                        value={form.categoryId}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        required
                                        disabled={categoriesLoading}
                                        className="w-full rounded-medium border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none disabled:opacity-50"
                                    >
                                        <option value="">
                                            {categoriesLoading ? 'Loading categories...' : '-- Choose Category --'}
                                        </option>
                                        {categories.map((cat) => {
                                            const id = String(cat._id || cat.id);
                                            return (
                                                <option key={id} value={id}>
                                                    {cat.name || cat.title}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {requestType === 'standard' ? (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Product</label>
                                        <select
                                            value={form.productId}
                                            onChange={(e) => handleProductSelect(e.target.value)}
                                            required
                                            disabled={!form.categoryId}
                                            className="w-full rounded-medium border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none disabled:opacity-50"
                                        >
                                            <option value="">
                                                {productsLoading ? 'Loading products...' : !form.categoryId ? 'Select category first' : '-- Choose a product --'}
                                            </option>
                                            {availableProducts.map((prod) => {
                                                const id = String(prod._id || prod.id);
                                                return (
                                                    <option key={id} value={id}>
                                                        {prod.name || prod.title}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Product Name (Custom)</label>
                                        <Input
                                            placeholder="Enter new product name"
                                            value={form.productName}
                                            onChange={(e) => setForm({ ...form, productName: e.target.value })}
                                            required
                                            variant="bordered"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800" />

                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/40">
                                        <FiLayers className="text-emerald-700 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">2. Product Variants & Stock Quantity Needed</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Enter the required quantity for each variant below.</p>
                                    </div>
                                </div>
                            </div>

                            {form.variants.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
                                    <p className="text-xs text-gray-400">Select a category and product above to load its variants.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {form.variants.map((variant, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-[#202e25]">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                                                        {variant.variantSku}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Available Warehouse Stock: <b>{variant.availableStock}</b>
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                    {variant.attributes && variant.attributes.map((attr, aIdx) => (
                                                        <span key={aIdx} className="bg-white px-2 py-0.5 rounded border border-gray-200 ">
                                                            <b>{attr.attributeType}:</b> {attr.attributeValue}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="w-full sm:w-48">
                                                <Input
                                                    size="sm"
                                                    type="number"
                                                    min="0"
                                                    max={variant.availableStock}
                                                    label="Quantity Needed"
                                                    placeholder="0"
                                                    value={String(variant.quantity)}
                                                    onChange={(e) => handleVariantQuantityChange(index, e.target.value)}
                                                    variant="bordered"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/25 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Request Summary</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Total units requested across all variants.</p>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                        {form.variants.filter(v => Number(v.quantity) > 0).length}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Selected Variants</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{totalQuantity}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Total Units</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800" />

                        <div className="space-y-1.5">
                            <div className="mb-3">
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white">3. Additional Information & Notes</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Add any instructions or explanations for admin review.</p>
                            </div>

                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                                Manager Note
                            </label>
                            <TextArea
                                placeholder="Explain why this stock is required or provide any delivery instructions..."
                                value={form.managerNote}
                                onChange={(e) => setForm({ ...form, managerNote: e.target.value })}
                                rows={3}
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row sm:justify-end">
                            <Button
                                variant="flat"
                                onPress={() => router.back()}
                                isDisabled={loading}
                                className="w-full bg-gray-100 font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:w-auto"
                            >
                                Cancel
                            </Button>

                            <Button
                                color="success"
                                type="submit"
                                isLoading={loading}
                                startContent={!loading && <FiCheckCircle />}
                                className="w-full bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 sm:w-auto"
                            >
                                Submit Stock Request
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}