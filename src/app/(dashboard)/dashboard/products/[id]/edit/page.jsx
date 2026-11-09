'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Button, Input, Select, ListBox, Card } from "@heroui/react";
import { useRouter, useParams } from 'next/navigation';
import { FiPlus, FiTrash2, FiArrowLeft, FiBox, FiUpload, FiX, FiLayers } from "react-icons/fi";
import toast from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';
import Image from 'next/image';
import { uploadImage } from '@/lib/api/upload';
import { actionUpdateMainProduct } from '@/lib/actions/product';
import { getAllCategories, getMainProductById } from '@/lib/api/product';
import EditSuccessModal from '@/component/dashboard/product/modal/EditSuccessModal';

function EditProductContent() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [categories, setCategories] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const { data: session } = useSession();
    const sessionUser = session?.user;

    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        sku: '',
        totalStock: '',
        pieceValue: '',
        description: '',
        images: [],
        lowStockThreshold: '5',
        variants: [
            { variantSku: '', size: '', color: '', volumeOrWeight: '', pricePerPiece: '', variantStock: '' }
        ]
    });

    useEffect(() => {
        async function loadInitialData() {
            try {
                const [catRes, prodRes] = await Promise.all([
                    getAllCategories(),
                    productId ? getMainProductById(productId) : Promise.resolve(null)
                ]);

                if (catRes && catRes.success) {
                    setCategories(catRes.data || []);
                }

                if (prodRes && prodRes.success && prodRes.data) {
                    const p = prodRes.data;
                    const originalImages = p.images || [];

                    setExistingImages(originalImages);
                    setImagePreviews(originalImages);

                    setFormData({
                        name: p.name || '',
                        categoryId: p.categoryId ? String(p.categoryId) : '',
                        sku: p.sku || '',
                        totalStock: p.totalStock !== undefined ? String(p.totalStock) : '',
                        pieceValue: p.pieceValue !== undefined ? String(p.pieceValue) : '',
                        description: p.description || '',
                        images: originalImages,
                        lowStockThreshold: p.lowStockThreshold !== undefined ? String(p.lowStockThreshold) : '5',
                        variants: p.variants && p.variants.length > 0
                            ? p.variants.map(v => ({
                                variantSku: v.variantSku || '',
                                size: v.size || '',
                                color: v.color || '',
                                volumeOrWeight: v.volumeOrWeight || '',
                                pricePerPiece: v.pricePerPiece !== undefined ? String(v.pricePerPiece) : '',
                                variantStock: v.variantStock !== undefined ? String(v.variantStock) : ''
                            }))
                            : [{ variantSku: '', size: '', color: '', volumeOrWeight: '', pricePerPiece: '', variantStock: '' }]
                    });
                } else if (prodRes && !prodRes.success) {
                    toast.error(prodRes.message || 'Failed to fetch product details.');
                }
            } catch (err) {
                console.error("Failed to load edit product data", err);
                toast.error("An error occurred while loading data.");
            } finally {
                setFetching(false);
            }
        }
        loadInitialData();
    }, [productId]);

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    const addVariantField = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { variantSku: '', size: '', color: '', volumeOrWeight: '', pricePerPiece: '', variantStock: '' }]
        });
    };

    const removeVariantField = (index) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            variants: newVariants.length ? newVariants : [{ variantSku: '', size: '', color: '', volumeOrWeight: '', pricePerPiece: '', variantStock: '' }]
        });
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setImageFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (index) => {
        const previewToRemove = imagePreviews[index];
        if (previewToRemove.startsWith('blob:')) {
            const blobPreviewsBefore = imagePreviews.slice(0, index).filter(p => p.startsWith('blob:')).length;
            setImageFiles(prev => prev.filter((_, i) => i !== blobPreviewsBefore));
        } else {
            setExistingImages(prev => prev.filter(img => img !== previewToRemove));
        }
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();

        const totalStockNum = Number(formData.totalStock);
        const pieceValueNum = Number(formData.pieceValue);
        const lowStockNum = Number(formData.lowStockThreshold);

        if (totalStockNum < 0 || pieceValueNum < 0 || lowStockNum < 0) {
            toast.error("Stock, price, and threshold values cannot be negative.");
            return;
        }

        for (const [i, v] of formData.variants.entries()) {
            const vPrice = Number(v.pricePerPiece);
            const vStock = Number(v.variantStock);
            if (vPrice < 0 || vStock < 0) {
                toast.error(`Variant #${i + 1} pricing and stock quantity cannot be negative.`);
                return;
            }
        }

        const calculatedVariantSum = formData.variants.reduce((acc, v) => acc + Number(v.variantStock || 0), 0);

        if (calculatedVariantSum !== totalStockNum) {
            toast.error(`Variant stock sum (${calculatedVariantSum}) must match total stock (${totalStockNum}).`);
            return;
        }

        setConfirmModalOpen(true);
    };

    const handleConfirmUpdate = async () => {
        setLoading(true);
        const toastId = toast.loading('Uploading new images & saving updates...');

        try {
            let finalImageUrls = [...existingImages];

            for (const file of imageFiles) {
                const uploadData = new FormData();
                uploadData.append('image', file);
                const uploadRes = await uploadImage(uploadData);
                if (uploadRes && (uploadRes.url || uploadRes.data?.url)) {
                    finalImageUrls.push(uploadRes.url || uploadRes.data.url);
                }
            }

            const authorIdentifier = sessionUser?.employeeId || sessionUser?.email || 'System';

            const payload = {
                ...formData,
                images: finalImageUrls,
                totalStock: Number(formData.totalStock),
                pieceValue: Number(formData.pieceValue),
                lowStockThreshold: Number(formData.lowStockThreshold),
                variants: formData.variants.map(v => ({
                    ...v,
                    pricePerPiece: Number(v.pricePerPiece),
                    variantStock: Number(v.variantStock)
                })),
                updatedBy: authorIdentifier
            };

            const res = await actionUpdateMainProduct(productId, payload);
            if (res && res.success) {
                toast.success('Product updated successfully!', { id: toastId });
                setConfirmModalOpen(false);
                router.push('/dashboard/products');
            } else {
                toast.error(res?.message || 'Failed to update product.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-20 text-center">
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading product edit form...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 pb-16">
            <div className="flex flex-col gap-3">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors w-fit">
                    <FiArrowLeft size={16} /> Back to Products
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-emerald-100 p-5 sm:p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <FiBox size={12} /> Inventory Catalog
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Edit Main Stock Product</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Update product images, define categories, stock pools, and dynamic variants.</p>
                    </div>
                </div>
            </div>

            <Card className="w-full border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl">
                <div className="p-5 sm:p-8">
                    <form onSubmit={handlePreSubmit} className="w-full space-y-6">

                        {/* --- Multi-Image Upload Section --- */}
                        <div className="space-y-3 pb-6 border-b border-gray-100">
                            <label className="text-sm font-semibold text-gray-700 block">Product Images (Multiple Allowed)</label>

                            <div className="flex flex-wrap gap-4 items-center">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-200 bg-gray-50 shrink-0 flex items-center justify-center shadow-sm">
                                        <Image src={preview} alt={`Preview ${index}`} fill sizes="96px" unoptimized className="object-cover" />
                                        {index === 0 && (
                                            <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold text-center py-0.5">
                                                Primary
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                ))}

                                <label className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 cursor-pointer transition-colors">
                                    <FiUpload size={20} />
                                    <span className="text-[10px] font-semibold mt-1">Add Image</span>
                                    <input type="file" multiple accept="image/*" onChange={handleImagesChange} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400">First uploaded image will act as the primary display thumbnail.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                            <div className="space-y-1.5 w-full">
                                <label className="text-sm font-semibold text-gray-700 block">Product Name</label>
                                <Input className="w-full" placeholder="e.g. Fresh Organic Milk" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required variant="bordered" />
                            </div>
                            <div className="space-y-1.5 w-full">
                                <label className="text-sm font-semibold text-gray-700 block">Base SKU</label>
                                <Input className="w-full" placeholder="e.g. MILK-ORG-001" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required variant="bordered" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                            <div className="space-y-1.5 w-full">
                                <label className="text-sm font-semibold text-gray-700 block">Category</label>
                                <Select
                                    className="w-full"
                                    selectedKey={formData.categoryId}
                                    onSelectionChange={(key) => setFormData({ ...formData, categoryId: key || "" })}
                                    placeholder="Select category"
                                    variant="bordered"
                                >
                                    <Select.Trigger className="w-full"><Select.Value /><Select.Indicator /></Select.Trigger>
                                    <Select.Popover className="w-full">
                                        <ListBox className="w-full">
                                            {categories.length > 0 ? categories.map((cat) => {
                                                const catId = String(cat._id || cat.id);
                                                return (
                                                    <ListBox.Item key={catId} id={catId} textValue={cat.name}>
                                                        {cat.name} <ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                );
                                            }) : (
                                                <ListBox.Item key="no-cat" id="no-cat" textValue="No categories available" isDisabled>No categories available</ListBox.Item>
                                            )}
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>
                            <div className="space-y-1.5 w-full">
                                <label className="text-sm font-semibold text-gray-700 block">Low Stock Alert Limit</label>
                                <Input className="w-full" type="number" min="0" placeholder="e.g. 5" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })} required variant="bordered" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                            <div className="space-y-1.5 w-full">
                                <label className="text-sm font-semibold text-gray-700 block">Total Stock Count</label>
                                <Input className="w-full" type="number" min="0" placeholder="e.g. 100" value={formData.totalStock} onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })} required variant="bordered" />
                            </div>
                            <div className="space-y-1.5 w-full">
                                <label className="text-sm font-semibold text-gray-700 block">Piece Base Value / Cost</label>
                                <Input className="w-full" type="number" min="0" placeholder="e.g. 120" value={formData.pieceValue} onChange={(e) => setFormData({ ...formData, pieceValue: e.target.value })} required variant="bordered" />
                            </div>
                        </div>

                        <div className="space-y-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-700 block">Description</label>
                            <Input className="w-full" placeholder="Enter product details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} variant="bordered" />
                        </div>

                        {/* --- Responsive Variant Section --- */}
                        <div className="space-y-5 pt-6 border-t border-gray-100 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-1">
                                        <FiLayers size={12} /> Stock Matrix
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Product Variants & Attributes</h3>
                                    <p className="text-xs text-gray-500">Configure size, color, and attributes. Variant stock sum must match Total Stock.</p>
                                </div>
                                <Button size="sm" variant="flat" className="w-full sm:w-auto bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 px-4" onPress={addVariantField}>
                                    <FiPlus size={16} /> Add Variant
                                </Button>
                            </div>

                            <div className="space-y-4 w-full">
                                {formData.variants.map((v, index) => (
                                    <div key={index} className="w-full bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 sm:p-5 space-y-4 transition-all hover:border-emerald-200 hover:shadow-sm">
                                        <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                                                Variant #{index + 1}
                                            </span>
                                            {formData.variants.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    className="text-red-600 hover:bg-red-50 text-xs font-semibold h-7 px-2"
                                                    onPress={() => removeVariantField(index)}
                                                >
                                                    <FiTrash2 size={14} className="mr-1" /> Remove
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                            <div className="space-y-1 w-full">
                                                <label className="text-xs font-semibold text-gray-600">Variant SKU</label>
                                                <Input
                                                    className="w-full bg-white"
                                                    placeholder="e.g. MILK-ORG-1L"
                                                    value={v.variantSku}
                                                    onChange={(e) => handleVariantChange(index, 'variantSku', e.target.value)}
                                                    required
                                                    variant="bordered"
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="space-y-1 w-full">
                                                <label className="text-xs font-semibold text-gray-600">Size (Optional)</label>
                                                <Input
                                                    className="w-full bg-white"
                                                    placeholder="e.g. L / 42 / Regular"
                                                    value={v.size}
                                                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                    variant="bordered"
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="space-y-1 w-full">
                                                <label className="text-xs font-semibold text-gray-600">Color (Optional)</label>
                                                <Input
                                                    className="w-full bg-white"
                                                    placeholder="e.g. Red / Navy Blue"
                                                    value={v.color}
                                                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                    variant="bordered"
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="space-y-1 w-full">
                                                <label className="text-xs font-semibold text-gray-600">Volume / Weight (Optional)</label>
                                                <Input
                                                    className="w-full bg-white"
                                                    placeholder="e.g. 1L / 500g"
                                                    value={v.volumeOrWeight}
                                                    onChange={(e) => handleVariantChange(index, 'volumeOrWeight', e.target.value)}
                                                    variant="bordered"
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="space-y-1 w-full">
                                                <label className="text-xs font-semibold text-gray-600">Price Per Unit</label>
                                                <Input
                                                    className="w-full bg-white"
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g. 150"
                                                    value={v.pricePerPiece}
                                                    onChange={(e) => handleVariantChange(index, 'pricePerPiece', e.target.value)}
                                                    required
                                                    variant="bordered"
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="space-y-1 w-full">
                                                <label className="text-xs font-semibold text-gray-600">Variant Stock Qty</label>
                                                <Input
                                                    className="w-full bg-white"
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g. 50"
                                                    value={v.variantStock}
                                                    onChange={(e) => handleVariantChange(index, 'variantStock', e.target.value)}
                                                    required
                                                    variant="bordered"
                                                    size="sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-100 w-full">
                            <Button type="button" variant="bordered" onPress={() => router.back()} className="w-full sm:w-auto border-gray-200 text-gray-700 font-medium">Cancel</Button>
                            <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/25 px-8">Save Updates</Button>
                        </div>

                    </form>
                </div>
            </Card>

            <EditSuccessModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmUpdate}
                productName={formData.name}
                loading={loading}
            />
        </div>
    );
}

export default function EditProductPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-5xl mx-auto px-4 py-20 text-center">
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading edit product page...</p>
            </div>
        }>
            <EditProductContent />
        </Suspense>
    );
}