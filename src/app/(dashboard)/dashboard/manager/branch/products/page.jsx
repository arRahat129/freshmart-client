'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Button, Input, Pagination, Modal } from '@heroui/react';
import { FiSearch, FiEye, FiRotateCcw, FiTrash2, FiMapPin, FiUser, FiBox, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import BranchProductDetailsModal from '@/component/dashboard/branch/modal/BranchProductDetailsModal';
import BranchProductDeleteModal from '@/component/dashboard/branch/modal/BranchProductDeleteModal';
import { useRoleGuard } from '@/lib/useRoleGuard';

import { getAllBranchProducts } from '@/lib/api/branchCustomProduct';
import { getAllCategories } from '@/lib/api/product';

import { actionReturnBranchStockToMain, actionDeleteBranchProduct } from '@/lib/actions/branchCustomProduct';

export default function BranchProductsPage({ branchId }) {
    const { isPending: isAuthPending, allowed } = useRoleGuard(['manager']);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [branchInfo, setBranchInfo] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('latest');
    const [stockFilter, setStockFilter] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const [deleteProductTarget, setDeleteProductTarget] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [returnTarget, setReturnTarget] = useState(null);
    const [returnVariantSku, setReturnVariantSku] = useState('');
    const [returnQuantityInput, setReturnQuantityInput] = useState('');
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isConfirmReturnOpen, setIsConfirmReturnOpen] = useState(false);

    const [isPending, startTransition] = useTransition();

    const [lastFetchedKey, setLastFetchedKey] = useState('');

    useEffect(() => {
        if (!allowed) return;

        let isMounted = true;
        getAllCategories()
            .then((res) => {
                if (isMounted && res?.success) {
                    setCategories(res.data || []);
                }
            })
            .catch(() => { });

        return () => {
            isMounted = false;
        };
    }, [allowed]);

    useEffect(() => {
        if (!allowed) return;

        const currentKey = `${branchId}-${search}-${sort}-${stockFilter}-${categoryId}-1`;
        if (lastFetchedKey === currentKey) return;

        let isMounted = true;

        const loadProducts = async () => {
            try {
                const res = await getAllBranchProducts({
                    branchId: branchId || '',
                    page: 1,
                    limit: 12,
                    search,
                    sort,
                    stockFilter,
                    categoryId
                });
                if (isMounted && res.success) {
                    setProducts(res.data);
                    setPagination(res.pagination);
                    if (res.branchInfo) {
                        setBranchInfo(res.branchInfo);
                    }
                    setLastFetchedKey(currentKey);
                } else if (isMounted) {
                    toast.error('Failed to load branch inventory products.');
                }
            } catch (error) {
                if (isMounted) {
                    toast.error('Failed to load branch inventory products.');
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, [branchId, search, sort, stockFilter, categoryId, allowed, lastFetchedKey]);

    const fetchBranchProducts = async (page = 1) => {
        try {
            const res = await getAllBranchProducts({
                branchId: branchId || '',
                page,
                limit: 12,
                search,
                sort,
                stockFilter,
                categoryId
            });
            if (res.success) {
                setProducts(res.data);
                setPagination(res.pagination);
                if (res.branchInfo) {
                    setBranchInfo(res.branchInfo);
                }
            } else {
                toast.error('Failed to load branch inventory products.');
            }
        } catch (error) {
            toast.error('Failed to load branch inventory products.');
        }
    };

    const handleSearchConfirm = () => {
        setSearch(searchInput.trim());
    };

    const handleResetFilters = () => {
        setSearchInput('');
        setSearch('');
        setSort('latest');
        setStockFilter('');
        setCategoryId('');
    };

    const getProductVariants = (prod) => {
        if (Array.isArray(prod?.variants) && prod.variants.length > 0) {
            return prod.variants;
        }
        return [{
            _id: prod._id,
            variantSku: prod.variantSku,
            size: prod.size || 'Standard',
            color: prod.color || 'Default',
            stock: prod.stock ?? prod.requestedStock ?? 0
        }];
    };

    const handleReturnButtonClick = (prod) => {
        const totalStockCount = prod.totalStock ?? prod.stock ?? prod.requestedStock ?? 0;
        if (totalStockCount <= 0) {
            toast.error('No stock available to return.');
            return;
        }

        const variantsList = getProductVariants(prod);
        setReturnTarget(prod);
        setReturnVariantSku(variantsList[0]?.variantSku || prod.variantSku || '');
        setReturnQuantityInput('');
        setIsReturnModalOpen(true);
    };

    const handleProceedToConfirmReturn = () => {
        if (!returnTarget) return;

        const variantsList = getProductVariants(returnTarget);
        const chosenSku = variantsList.length > 1
            ? returnVariantSku
            : (variantsList[0]?.variantSku || returnTarget.variantSku);
        const targetVariant = variantsList.find(v => v.variantSku === chosenSku) || variantsList[0];
        const availableStock = Number(targetVariant?.stock ?? returnTarget.stock ?? returnTarget.requestedStock ?? 0);
        const qty = Number(returnQuantityInput || 0);

        if (!chosenSku) {
            toast.error('Please select a variant.');
            return;
        }
        if (qty <= 0) {
            toast.error('Please enter a return quantity greater than 0.');
            return;
        }
        if (qty > availableStock) {
            toast.error(`Cannot return more than ${availableStock} units available for this variant.`);
            return;
        }

        setIsReturnModalOpen(false);
        setIsConfirmReturnOpen(true);
    };

    const handleConfirmReturnStock = () => {
        if (!returnTarget) return;

        const variantsList = getProductVariants(returnTarget);
        const chosenSku = variantsList.length > 1
            ? returnVariantSku
            : (variantsList[0]?.variantSku || returnTarget.variantSku);
        const qty = Number(returnQuantityInput || 0);

        startTransition(async () => {
            const res = await actionReturnBranchStockToMain({
                branchId: branchId || returnTarget.branchId,
                productId: returnTarget.productId,
                variantSku: chosenSku,
                returnQuantity: qty,
                productType: returnTarget.productType
            });

            if (res.success) {
                toast.success('Stock successfully returned to main warehouse.');
                setIsConfirmReturnOpen(false);
                setReturnTarget(null);
                setReturnVariantSku('');
                setReturnQuantityInput('');
                fetchBranchProducts(pagination.currentPage);
            } else {
                toast.error(res.message || 'Failed to return stock.');
            }
        });
    };

    const openDeleteDialog = (prod) => {
        const currentStock = prod.totalStock ?? prod.stock ?? prod.requestedStock ?? 0;
        if (currentStock > 0) {
            toast.error('Cannot delete product! Please sell or return all remaining stock before deleting.');
            return;
        }
        setDeleteProductTarget(prod);
        setIsDeleteOpen(true);
    };

    const confirmDeleteProduct = () => {
        if (!deleteProductTarget) return;

        startTransition(async () => {
            const res = await actionDeleteBranchProduct(deleteProductTarget._id, deleteProductTarget.productType);
            if (res.success) {
                toast.success('Product deleted from branch successfully.');
                setIsDeleteOpen(false);
                setDeleteProductTarget(null);
                fetchBranchProducts(pagination.currentPage);
            } else {
                toast.error(res.message || 'Failed to delete product.');
            }
        });
    };

    if (isAuthPending || !allowed) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <p className="text-sm text-gray-500 animate-pulse">Verifying manager access...</p>
            </div>
        );
    }

    const modalVariants = returnTarget ? getProductVariants(returnTarget) : [];
    const activeModalVariant = modalVariants.find(v => v.variantSku === returnVariantSku) || modalVariants[0];
    const activeModalStock = Number(activeModalVariant?.stock ?? returnTarget?.stock ?? returnTarget?.requestedStock ?? 0);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Branch Inventory Catalog</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage branch stock allocations, return items to warehouse, and create stock requests.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <Button
                        as={Link}
                        href="/dashboard/manager/request"
                        color="primary"
                        className="font-medium text-xs sm:text-sm h-11 bg-emerald-600 hover:bg-emerald-700"
                        startContent={<FiPlus className="size-4" />}
                    >
                        Create Stock Request
                    </Button>

                    {branchInfo && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 text-sm flex-1">
                                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                                    <FiMapPin className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Branch</p>
                                    <p className="font-semibold text-gray-900 text-sm truncate max-w-50" title={branchInfo.branchName}>
                                        {branchInfo.branchName}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px sm:h-8 w-full sm:w-px bg-gray-200 my-1 sm:my-0" />

                            <div className="flex items-center gap-3 text-sm flex-1">
                                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                                    <FiUser className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Manager</p>
                                    <p className="font-semibold text-gray-900 text-sm truncate max-w-50" title={branchInfo.managerName}>
                                        {branchInfo.managerName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-3.5 text-gray-400 size-4 z-10 pointer-events-none" />
                        <Input
                            placeholder="Search product name or SKU..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearchConfirm();
                            }}
                            className="pl-9 w-full"
                        />
                    </div>
                    <Button
                        color="primary"
                        onPress={handleSearchConfirm}
                        className="h-10 px-4 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    >
                        Search
                    </Button>
                </div>

                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => {
                        const id = String(cat._id || cat.id);
                        return (
                            <option key={id} value={id}>
                                {cat.name}
                            </option>
                        );
                    })}
                </select>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                >
                    <option value="latest">Sort: Latest Added</option>
                    <option value="oldest">Sort: Oldest Added</option>
                    <option value="nameAsc">Name: A to Z</option>
                    <option value="nameDesc">Name: Z to A</option>
                    <option value="stockAsc">Stock: Low to High</option>
                    <option value="stockDesc">Stock: High to Low</option>
                </select>

                <div className="flex items-center gap-2">
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="flex-1 h-10 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                    >
                        <option value="">All Stock Status</option>
                        <option value="inStock">In Stock (&gt;5)</option>
                        <option value="lowStock">Low Stock (1 - 5)</option>
                        <option value="outOfStock">Out of Stock (0)</option>
                    </select>

                    <Button
                        variant="flat"
                        onPress={handleResetFilters}
                        className="h-10 font-medium shrink-0"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 text-gray-400">
                    <FiBox className="size-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-base text-gray-600">No branch products found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((prod) => {
                        const img = prod.images?.[0] || "https://i.ibb.co.com/JwgTBWgB/freshmart-logo.jpg";
                        const variantsList = getProductVariants(prod);
                        const hasMultipleVariants = variantsList.length > 1;
                        const totalStockCount = prod.totalStock ?? prod.stock ?? prod.requestedStock ?? 0;

                        return (
                            <div key={prod.groupId || prod._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 pb-3 flex items-start gap-3.5 border-b border-gray-100">
                                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-200 shrink-0">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${totalStockCount === 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                                {totalStockCount === 0 ? 'Out of Stock' : `${totalStockCount} total units`}
                                            </span>
                                            <span className="text-[10px] uppercase font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {prod.productType}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-base truncate" title={prod.productName}>
                                            {prod.productName}
                                        </h3>
                                        {hasMultipleVariants ? (
                                            <p className="text-xs font-medium text-emerald-700 mt-0.5">
                                                {variantsList.length} variants available
                                            </p>
                                        ) : (
                                            <p className="font-mono text-xs text-gray-500 mt-0.5 truncate" title={variantsList[0]?.variantSku}>
                                                {variantsList[0]?.variantSku}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 py-3 space-y-2 text-xs text-gray-600 bg-gray-50/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium">Total Stock:</span>
                                        <span className="font-bold text-gray-900">{totalStockCount} units</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium">Price per unit:</span>
                                        <span className="font-bold text-gray-900 text-sm">
                                            BDT {prod.pricePerPiece || prod.pieceValue || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-white border-t border-gray-100">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        isDisabled={totalStockCount === 0 || isPending}
                                        onPress={() => handleReturnButtonClick(prod)}
                                        className="w-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    >
                                        <FiRotateCcw className="size-3.5" /> Return Stock
                                    </Button>
                                </div>

                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        onPress={() => { setSelectedProduct(prod); setIsDetailsOpen(true); }}
                                        className="text-xs text-emerald-600 font-medium h-8 px-3"
                                    >
                                        <FiEye className="size-4 mr-1.5" /> View Details
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        isDisabled={totalStockCount > 0 || isPending}
                                        title={totalStockCount > 0 ? "Cannot delete: Sell or return remaining stock first." : "Delete product"}
                                        onPress={() => openDeleteDialog(prod)}
                                        className="text-xs font-medium h-8 px-3"
                                    >
                                        <FiTrash2 className="size-4 mr-1.5" /> Delete
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-xs text-gray-500 text-center sm:text-left">
                        Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalProducts} total products)
                    </p>
                    <Pagination
                        total={pagination.totalPages}
                        page={pagination.currentPage}
                        onChange={(page) => fetchBranchProducts(page)}
                    />
                </div>
            )}

            <Modal isOpen={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                <Modal.Backdrop>
                    <Modal.Container placement="center">
                        <Modal.Dialog className="max-w-md bg-white p-6 rounded-xl shadow-xl">
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading className="text-lg font-bold text-gray-900">
                                    Return Stock to Warehouse
                                </Modal.Heading>
                                {returnTarget && (
                                    <p className="text-xs text-gray-500 mt-1">{returnTarget.productName}</p>
                                )}
                            </Modal.Header>

                            <div className="mt-4 space-y-4">
                                {modalVariants.length > 1 ? (
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Select Variant
                                        </label>
                                        <select
                                            value={returnVariantSku}
                                            onChange={(e) => setReturnVariantSku(e.target.value)}
                                            className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
                                        >
                                            {modalVariants.map((v, idx) => (
                                                <option key={v._id || v.variantSku || idx} value={v.variantSku}>
                                                    {v.color || 'Default'} / {v.size || 'Standard'} ({v.variantSku}) — {v.stock ?? 0} units
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {activeModalVariant?.color || 'Default'} / {activeModalVariant?.size || 'Standard'}
                                            </p>
                                            <p className="font-mono text-gray-500 mt-0.5">{activeModalVariant?.variantSku}</p>
                                        </div>
                                        <span className="font-bold text-emerald-700">{activeModalStock} units</span>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <label className="font-semibold text-gray-700">
                                            Quantity to Return
                                        </label>
                                        <span className="text-gray-500">Available: {activeModalStock} units</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max={activeModalStock}
                                        placeholder="Enter quantity"
                                        value={returnQuantityInput}
                                        onChange={(e) => setReturnQuantityInput(e.target.value)}
                                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                                    />
                                </div>
                            </div>

                            <Modal.Footer className="mt-6 flex justify-end gap-2">
                                <Button variant="flat" onPress={() => setIsReturnModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleProceedToConfirmReturn}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Return
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            <Modal isOpen={isConfirmReturnOpen} onOpenChange={setIsConfirmReturnOpen}>
                <Modal.Backdrop>
                    <Modal.Container placement="center">
                        <Modal.Dialog className="max-w-md bg-white p-6 rounded-xl shadow-xl">
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading className="text-lg font-bold text-gray-900">
                                    Confirm Stock Return
                                </Modal.Heading>
                            </Modal.Header>

                            <div className="mt-3 space-y-2 text-sm text-gray-600">
                                <p>
                                    Are you sure you want to return <span className="font-bold text-gray-900">{Number(returnQuantityInput || 0)}</span> units of{' '}
                                    <span className="font-semibold text-gray-900">{returnTarget?.productName}</span> ({activeModalVariant?.color || 'Default'} / {activeModalVariant?.size || 'Standard'}) to the main warehouse?
                                </p>
                                <p className="font-mono text-xs text-gray-500">SKU: {activeModalVariant?.variantSku}</p>
                            </div>

                            <Modal.Footer className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="flat"
                                    isDisabled={isPending}
                                    onPress={() => setIsConfirmReturnOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    isDisabled={isPending}
                                    onPress={handleConfirmReturnStock}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Confirm Return
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            <BranchProductDetailsModal
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                product={selectedProduct}
                categories={categories}
            />
            <BranchProductDeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDeleteProduct}
                product={deleteProductTarget}
                isPending={isPending}
            />
        </div>
    );
}