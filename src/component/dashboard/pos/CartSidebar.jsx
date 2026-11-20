'use client';

import React from 'react';
import { Button } from "@heroui/react";
import Image from 'next/image';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiPlus, FiMinus } from 'react-icons/fi';

export default function CartSidebar({ cart, onUpdateQty, onRemoveItem, onClearCart, onProceed }) {
    const overallTotal = cart.reduce((sum, item) => sum + item.pricePerPiece * item.quantity, 0);
    const totalPieces = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-emerald-950/5 flex flex-col h-[calc(100vh-140px)] sticky top-6">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FiShoppingBag size={18} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-base">Current Order</h2>
                        <p className="text-xs text-gray-500">{cart.length} items ({totalPieces} pcs)</p>
                    </div>
                </div>
                {cart.length > 0 && (
                    <button
                        onClick={onClearCart}
                        className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
                        <FiShoppingBag size={36} className="text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">Customer bag is empty</p>
                        <p className="text-xs">Search by SKU on the left and select product variants to add them here.</p>
                    </div>
                ) : (
                    cart.map((item) => {
                        const itemTotal = item.pricePerPiece * item.quantity;
                        const imageSrc = (Array.isArray(item.images) && item.images[0]) || "https://i.ibb.co.com/JwgTBWgB/freshmart-logo.jpg";
                        const variantText =
                            item.variantLabel ||
                            item.variantValue ||
                            (Array.isArray(item.variantAttributes) && item.variantAttributes.length > 0
                                ? item.variantAttributes
                                    .map((attr) => attr?.variantValue ?? attr?.attributeValue)
                                    .filter(Boolean)
                                    .join(' • ')
                                : '') ||
                            (Array.isArray(item.attributes) && item.attributes.length > 0
                                ? item.attributes
                                    .map((attr) => attr?.attributeValue ?? attr?.variantValue)
                                    .filter(Boolean)
                                    .join(' • ')
                                : '');

                        return (
                            <div
                                key={`${item._id}-${item.variantSku}`}
                                className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                                        <Image src={imageSrc} alt={item.productName} fill sizes="48px" unoptimized className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">{item.productName}</h4>
                                        <p className="text-xs text-gray-500">
                                            {item.variantSku}{variantText ? ` • ${variantText}` : ''}
                                        </p>
                                        <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                                            Unit Price: ৳{item.pricePerPiece.toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onRemoveItem(item.variantSku)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                        title="Remove item"
                                    >
                                        <FiTrash2 size={15} />
                                    </button>
                                </div>

                                {/* Price x Quantity Row */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200/70">
                                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-1.5 py-0.5">
                                        <button
                                            onClick={() => onUpdateQty(item.variantSku, item.quantity - 1)}
                                            className="p-1 text-gray-600 hover:text-emerald-700"
                                        >
                                            <FiMinus size={12} />
                                        </button>
                                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQty(item.variantSku, Math.min(item.stock, item.quantity + 1))}
                                            disabled={item.quantity >= item.stock}
                                            className="p-1 text-gray-600 hover:text-emerald-700 disabled:opacity-30"
                                        >
                                            <FiPlus size={12} />
                                        </button>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[11px] text-gray-400">
                                            ৳{item.pricePerPiece.toLocaleString()} × {item.quantity}
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">
                                            ৳{itemTotal.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Total & Checkout Button */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/70 rounded-b-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Overall Subtotal</span>
                    <span className="text-2xl font-extrabold text-gray-900">
                        ৳{overallTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>

                <Button
                    isDisabled={cart.length === 0}
                    onPress={onProceed}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base shadow-lg shadow-emerald-600/20"
                >
                    Proceed to Money Receipt <FiArrowRight size={18} className="ml-1" />
                </Button>
            </div>
        </div>
    );
}