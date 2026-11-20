'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Card } from "@heroui/react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiPlus, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';
import { searchBranchProductsBySku } from '@/lib/api/checkout';
import QuantitySelectModal from '@/component/dashboard/pos/QuantitySelectModal';
import CartSidebar from '@/component/dashboard/pos/CartSidebar';

const getVariantText = (item) =>
    item?.variantLabel ||
    item?.variantValue ||
    (Array.isArray(item?.variantAttributes) && item.variantAttributes.length > 0
        ? item.variantAttributes
            .map((attr) => attr?.variantValue ?? attr?.attributeValue)
            .filter(Boolean)
            .join(' • ')
        : '') ||
    (Array.isArray(item?.attributes) && item.attributes.length > 0
        ? item.attributes
            .map((attr) => attr?.attributeValue ?? attr?.variantValue)
            .filter(Boolean)
            .join(' • ')
        : '');

export default function CashierPosPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const sessionUser = session?.user;

    const [skuQuery, setSkuQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);

    const [cart, setCart] = useState(() => {
        if (typeof window === 'undefined') return [];
        const saved = sessionStorage.getItem('freshmart_pos_cart');
        if (!saved) return [];
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    // Save cart changes to external storage
    useEffect(() => {
        sessionStorage.setItem('freshmart_pos_cart', JSON.stringify(cart));
    }, [cart]);

    const fetchProducts = useCallback(async (searchTerm = '') => {
        if (!sessionUser) return;
        setLoading(true);
        try {
            const res = await searchBranchProductsBySku({
                sku: searchTerm,
                branchId: sessionUser.branchId || '',
                cashierId: sessionUser.id || sessionUser._id || ''
            });
            if (res?.success) {
                setProducts(res.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [sessionUser]);

    // Initial load & debounced SKU typing search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(skuQuery);
        }, 250);
        return () => clearTimeout(timer);
    }, [skuQuery, fetchProducts]);

    const handleOpenQtyModal = (product) => {
        if (Number(product.stock) <= 0) {
            toast.error('This variant is out of stock in your branch.');
            return;
        }
        setSelectedProduct(product);
        setIsQtyModalOpen(true);
    };

    const handleAddToCart = (product, qty) => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((item) => item.variantSku === product.variantSku);
            if (existingIndex > -1) {
                const updated = [...prev];
                const newQty = Math.min(product.stock, updated[existingIndex].quantity + qty);
                updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
                return updated;
            }
            return [...prev, { ...product, quantity: qty }];
        });
        toast.success(`Added ${qty} × ${product.productName}`);
    };

    const handleUpdateQty = (variantSku, newQty) => {
        if (newQty <= 0) {
            handleRemoveItem(variantSku);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.variantSku === variantSku ? { ...item, quantity: newQty } : item
            )
        );
    };

    const handleRemoveItem = (variantSku) => {
        setCart((prev) => prev.filter((item) => item.variantSku !== variantSku));
    };

    const handleClearCart = () => {
        setCart([]);
        sessionStorage.removeItem('freshmart_pos_cart');
    };

    const handleProceedToReceipt = () => {
        if (cart.length === 0) return;
        sessionStorage.setItem('freshmart_pos_cart', JSON.stringify(cart));
        router.push('/dashboard/pos/receipt');
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: SKU Search & Branch Variant Grid */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm space-y-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cashier POS Checkout</h1>
                            <p className="text-sm text-gray-500">Type or scan a Variant SKU to find available products in your branch.</p>
                        </div>

                        <div className="relative">
                            <FiSearch
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 z-10 pointer-events-none"
                                size={18}
                            />
                            <Input
                                placeholder="Type SKU (e.g. MAG-NITRO-PRE-500ML-BLK)..."
                                value={skuQuery}
                                onChange={(e) => setSkuQuery(e.target.value)}
                                variant="bordered"
                                size="lg"
                                className="pl-10 w-full"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Product Variants Results */}
                    {loading ? (
                        <div className="text-center py-12 text-sm text-gray-500">Searching branch inventory...</div>
                    ) : products.length === 0 ? (
                        <Card className="p-12 text-center border border-gray-200 rounded-2xl bg-white">
                            <FiPackage size={36} className="mx-auto text-gray-300 mb-2" />
                            <p className="font-semibold text-gray-700">No matching variants found</p>
                            <p className="text-xs text-gray-400 mt-1">Try typing another SKU or check if stock has been approved for your branch.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {products.map((item) => {
                                const imageSrc = (Array.isArray(item.images) && item.images[0]) || "https://i.ibb.co.com/JwgTBWgB/freshmart-logo.jpg";
                                const inStock = Number(item.stock) > 0;
                                const variantText = getVariantText(item);

                                return (
                                    <div
                                        key={`${item._id}-${item.variantSku}`}
                                        onClick={() => handleOpenQtyModal(item)}
                                        className={`group bg-white border rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between ${inStock
                                            ? 'border-gray-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/5'
                                            : 'border-gray-100 opacity-60 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                                <Image src={imageSrc} alt={item.productName} fill sizes="240px" unoptimized className="object-cover group-hover:scale-105 transition-transform duration-200" />
                                                <span className={`absolute top-2 right-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${inStock ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                                                    }`}>
                                                    {inStock ? `${item.stock} in stock` : 'Out of stock'}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-mono font-semibold text-emerald-700 truncate">
                                                    {item.variantSku}
                                                </p>
                                                <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mt-0.5">
                                                    {item.productName}
                                                </h3>
                                                {variantText && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{variantText}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                                            <span className="text-base font-extrabold text-gray-900">
                                                ৳{Number(item.pricePerPiece).toLocaleString()}
                                            </span>
                                            <Button
                                                size="sm"
                                                isDisabled={!inStock}
                                                onPress={() => handleOpenQtyModal(item)}
                                                className="bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white font-semibold transition-colors"
                                            >
                                                <FiPlus size={14} /> Select
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column: Side Box Customer Bag */}
                <div className="lg:col-span-4">
                    <CartSidebar
                        cart={cart}
                        onUpdateQty={handleUpdateQty}
                        onRemoveItem={handleRemoveItem}
                        onClearCart={handleClearCart}
                        onProceed={handleProceedToReceipt}
                    />
                </div>
            </div>

            {/* Variant Quantity Selection Modal */}
            <QuantitySelectModal
                isOpen={isQtyModalOpen}
                onClose={() => setIsQtyModalOpen(false)}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
}