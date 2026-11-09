'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card } from "@heroui/react";
import Link from 'next/link';
import Image from 'next/image';
import {
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiLayers,
    FiCheckCircle,
    FiAlertCircle
} from "react-icons/fi";
import toast from 'react-hot-toast';
import { getMainProductById } from '@/lib/api/product';

export default function MainProductDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        if (!productId) return;

        async function fetchProduct() {
            setLoading(true);
            try {
                const response = await getMainProductById(productId);
                if (response && response.success && response.data) {
                    const prodData = response.data;
                    setProduct(prodData);

                    if (prodData.images && prodData.images.length > 0) {
                        setActiveImage(prodData.images[0]);
                    }
                } else {
                    toast.error(response?.message || 'Failed to fetch product details.');
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
                toast.error('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-20 text-center">
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
                <p className="text-base font-semibold text-red-600">Product not found.</p>
                <Link href="/dashboard/products">
                    <Button variant="bordered">Back to Products</Button>
                </Link>
            </div>
        );
    }

    const imagesList = product.images || [];
    const variants = product.variants || [];

    return (
        <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 space-y-5 sm:space-y-6 pb-16">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <Link
                    href="/dashboard/products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors w-fit"
                >
                    <FiArrowLeft size={16} /> Back to Products
                </Link>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Link href={`/dashboard/products/${productId}/edit`} className="flex-1 sm:flex-none">
                        <Button
                            as="span"
                            variant="bordered"
                            className="w-full sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                        >
                            <FiEdit2 size={16} /> Edit Product
                        </Button>
                    </Link>

                    <Button
                        color="danger"
                        variant="flat"
                        className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 font-medium flex items-center justify-center gap-2 text-xs sm:text-sm"
                        onPress={() => {
                            toast.error("Delete functionality coming soon.");
                        }}
                    >
                        <FiTrash2 size={16} /> Delete
                    </Button>
                </div>
            </div>

            <Card className="w-full border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-8 space-y-6 sm:space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">

                    <div className="space-y-3 w-full">
                        <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-emerald-100 bg-gray-50 shadow-sm flex items-center justify-center">
                            {activeImage ? (
                                <Image
                                    src={activeImage}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 300px"
                                    unoptimized
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-xs text-gray-400">No Image Available</span>
                            )}
                        </div>

                        {imagesList.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {imagesList.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all flex items-center justify-center bg-gray-100 ${activeImage === img ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-gray-200'
                                            }`}
                                    >
                                        <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="64px" unoptimized className="object-cover" />
                                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md z-10">
                                            #{idx + 1}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                                SKU: {product.sku}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold ${product.isStockDepleted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                {product.isStockDepleted ? <FiAlertCircle size={12} /> : <FiCheckCircle size={12} />}
                                {product.isStockDepleted ? 'Stock Depleted' : 'In Stock'}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight break-words">{product.name}</h1>
                            <p className="text-xs text-gray-400 mt-1">Created By: <span className="font-medium text-gray-700">{product.createdBy || 'System'}</span></p>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/70 p-3.5 sm:p-4 rounded-xl border border-gray-100 break-words">
                            {product.description || 'No description provided for this product.'}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                            <div className="bg-emerald-50/50 border border-emerald-100/60 p-3.5 rounded-xl">
                                <span className="text-[11px] uppercase font-semibold text-gray-400 block">Total Stock</span>
                                <span className="text-base sm:text-lg font-bold text-emerald-900">{product.totalStock} units</span>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100/60 p-3.5 rounded-xl">
                                <span className="text-[11px] uppercase font-semibold text-gray-400 block">Piece Value</span>
                                <span className="text-base sm:text-lg font-bold text-emerald-700">৳{Number(product.pieceValue || 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100/60 p-3.5 rounded-xl">
                                <span className="text-[11px] uppercase font-semibold text-gray-400 block">Alert Threshold</span>
                                <span className="text-base sm:text-lg font-bold text-amber-600">{product.lowStockThreshold || 5} units</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FiLayers className="text-emerald-600" size={18} /> Variant Stock Matrix ({variants.length})
                        </h3>
                    </div>

                    {variants.length === 0 ? (
                        <p className="text-xs text-gray-400 py-4 bg-gray-50 rounded-xl text-center">No variants configured for this product.</p>
                    ) : (
                        <div className="rounded-2xl border border-gray-200 overflow-x-auto bg-white shadow-xs">
                            <table className="w-full text-left text-xs sm:text-sm min-w-[550px]">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                                    <tr>
                                        <th className="py-3 px-4">Variant SKU</th>
                                        <th className="py-3 px-4">Size</th>
                                        <th className="py-3 px-4">Color</th>
                                        <th className="py-3 px-4 text-right">Price Per Piece</th>
                                        <th className="py-3 px-4 text-right">Stock Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {variants.map((v, idx) => (
                                        <tr key={String(v._id || idx)} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-semibold text-emerald-800">{v.variantSku}</td>
                                            <td className="py-3 px-4 text-gray-600">{v.size || 'N/A'}</td>
                                            <td className="py-3 px-4 text-gray-600">{v.color || 'N/A'}</td>
                                            <td className="py-3 px-4 text-right font-semibold text-gray-800">৳{Number(v.pricePerPiece || 0).toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${v.isVariantDepleted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                                                    }`}>
                                                    {v.variantStock} units
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </Card>
        </div>
    );
}