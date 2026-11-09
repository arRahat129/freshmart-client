'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card } from "@heroui/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    FiArrowLeft,
    FiBox,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight,
    FiLayers,
    FiPackage
} from "react-icons/fi";
import toast from 'react-hot-toast';
import { getAllMainProducts, getAllCategories } from '@/lib/api/product';

const FALLBACK_IMAGE_URL = "https://i.ibb.co.com/JwgTBWgB/freshmart-logo.jpg";

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [categoriesMap, setCategoriesMap] = useState({});
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({
        totalProducts: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10
    });

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await getAllCategories();
                if (res && res.success && Array.isArray(res.data)) {
                    const map = {};
                    res.data.forEach(cat => {
                        const id = String(cat._id || cat.id);
                        map[id] = cat.name;
                    });
                    setCategoriesMap(map);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const res = await getAllMainProducts(page, limit);
                if (res && res.success) {
                    setProducts(res.data || []);
                    if (res.pagination) {
                        setPagination(res.pagination);
                    }
                } else {
                    toast.error(res?.message || "Failed to load products.");
                }
            } catch (err) {
                console.error("Error loading products:", err);
                toast.error("An error occurred while fetching products.");
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [page]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-16">
            <div className="flex flex-col gap-3">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors w-fit"
                >
                    <FiArrowLeft size={16} /> Back
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-emerald-100 p-5 sm:p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <FiBox size={12} /> Inventory Catalog
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            Main Stock Products
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Manage warehouse inventory, inspect product variants, and monitor stock thresholds.
                        </p>
                    </div>

                    <Link href="/dashboard/products/create" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 px-5 flex items-center justify-center gap-2">
                            <FiPlus size={18} /> Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="w-full border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-emerald-100 bg-emerald-50/60 text-xs font-bold uppercase tracking-wider text-emerald-900">
                                <th className="py-4 px-4 w-14 text-center">#</th>
                                <th className="py-4 px-4">Product</th>
                                <th className="py-4 px-4">SKU & Category</th>
                                <th className="py-4 px-4 text-center">Variants</th>
                                <th className="py-4 px-4 text-right">Base Cost</th>
                                <th className="py-4 px-4 text-center">Total Stock</th>
                                <th className="py-4 px-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="py-4 px-4 text-center">
                                            <div className="h-4 w-6 bg-gray-200 rounded mx-auto" />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-36 bg-gray-200 rounded" />
                                                    <div className="h-3 w-24 bg-gray-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="h-4 w-28 bg-gray-200 rounded mb-1.5" />
                                            <div className="h-3 w-20 bg-gray-100 rounded" />
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="h-6 w-12 bg-gray-200 rounded-full mx-auto" />
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="h-6 w-16 bg-gray-200 rounded-full mx-auto" />
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="h-8 w-24 bg-gray-200 rounded-lg ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                                                <FiPackage size={24} />
                                            </div>
                                            <p className="text-base font-semibold text-gray-800">No products found in main stock</p>
                                            <p className="text-xs text-gray-400">Add your first product to start tracking inventory.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => {
                                    const rowIndex = (page - 1) * limit + index + 1;
                                    const primaryImage = product.images[0]
                                    const categoryName =
                                        (product.categoryId && categoriesMap[String(product.categoryId)]) ||
                                        "Uncategorized";
                                    const variantCount = product.variants?.length || 0;
                                    const isLowStock =
                                        Number(product.totalStock) <= Number(product.lowStockThreshold || 5);
                                    const isOutOfStock = Number(product.totalStock) === 0;

                                    return (
                                        <tr
                                            key={String(product._id || index)}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="py-3.5 px-4 text-center font-semibold text-gray-500">
                                                {rowIndex}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-100 bg-gray-50 shrink-0 shadow-xs">
                                                        <Image
                                                            src={primaryImage}
                                                            alt={product.name || "Product"}
                                                            fill
                                                            sizes="48px"
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 max-w-55 sm:max-w-70">
                                                        <p className="font-bold text-gray-900 truncate">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {product.description || "No description"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="inline-block font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                                                    {product.sku}
                                                </span>
                                                <p className="text-xs text-emerald-700 font-medium mt-1">
                                                    {categoryName}
                                                </p>
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                                                    <FiLayers size={12} /> {variantCount}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right font-semibold text-gray-800">
                                                ৳{Number(product.pieceValue || 0).toLocaleString()}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isOutOfStock
                                                        ? "bg-red-100 text-red-700"
                                                        : isLowStock
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-emerald-100 text-emerald-800"
                                                        }`}
                                                >
                                                    {product.totalStock} pcs
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center justify-end gap-1.5">
                                                    <Link href={`/dashboard/products/${product._id}`}>
                                                        <button
                                                            type="button"
                                                            title="View Product"
                                                            className="p-2 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        title="Edit Product"
                                                        className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Delete Product"
                                                        className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-gray-800">
                                {products.length === 0 ? 0 : (page - 1) * limit + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-gray-800">
                                {Math.min(page * limit, pagination.totalProducts)}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-800">
                                {pagination.totalProducts}
                            </span>{" "}
                            products
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                size="sm"
                                variant="bordered"
                                isDisabled={page <= 1}
                                onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                                className="min-w-8 px-2.5 border-gray-200 text-gray-700 font-medium"
                            >
                                <FiChevronLeft size={16} /> Prev
                            </Button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === pageNum
                                        ? "bg-emerald-600 text-white shadow-sm"
                                        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <Button
                                size="sm"
                                variant="bordered"
                                isDisabled={page >= pagination.totalPages}
                                onPress={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                                className="min-w-8 px-2.5 border-gray-200 text-gray-700 font-medium"
                            >
                                Next <FiChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}