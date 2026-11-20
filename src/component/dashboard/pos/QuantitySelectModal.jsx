'use client';

import React, { useState } from 'react';
import { Button, Input } from "@heroui/react";
import Image from 'next/image';
import { FiX, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';

export default function QuantitySelectModal({ isOpen, onClose, product, onAddToCart }) {
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !product) return null;

    const maxStock = Number(product.stock || 0);
    const unitPrice = Number(product.pricePerPiece || 0);
    const lineTotal = (unitPrice * quantity).toFixed(2);
    const imageSrc = (Array.isArray(product.images) && product.images[0]) || "https://i.ibb.co.com/JwgTBWgB/freshmart-logo.jpg";

    const variantText =
        product.variantLabel ||
        product.variantValue ||
        (Array.isArray(product.variantAttributes) && product.variantAttributes.length > 0
            ? product.variantAttributes
                .map((attr) => attr?.variantValue ?? attr?.attributeValue)
                .filter(Boolean)
                .join(' • ')
            : '') ||
        (Array.isArray(product.attributes) && product.attributes.length > 0
            ? product.attributes
                .map((attr) => attr?.attributeValue ?? attr?.variantValue)
                .filter(Boolean)
                .join(' • ')
            : '');

    const handleConfirm = (e) => {
        e.preventDefault();
        if (quantity < 1 || quantity > maxStock) return;
        onAddToCart(product, Number(quantity));
        setQuantity(1);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-5 relative animate-in fade-in zoom-in duration-150">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiX size={20} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                        <Image src={imageSrc} alt={product.productName} fill sizes="64px" unoptimized className="object-cover" />
                    </div>
                    <div>
                        <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {product.variantSku}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">{product.productName}</h3>
                        {variantText && (
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{variantText}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-sm">
                    <div>
                        <p className="text-gray-400 text-xs">Unit Price</p>
                        <p className="font-bold text-gray-900 text-base">৳{unitPrice.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Available in Branch</p>
                        <p className={`font-bold text-base ${maxStock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {maxStock} pcs
                        </p>
                    </div>
                </div>

                {maxStock <= 0 ? (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-medium">
                        <FiAlertCircle size={18} /> Out of stock in this branch.
                    </div>
                ) : (
                    <form onSubmit={handleConfirm} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Enter Quantity</label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="bordered"
                                    isIconOnly
                                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    min={1}
                                    max={maxStock}
                                    value={String(quantity)}
                                    onChange={(e) => setQuantity(Math.min(maxStock, Math.max(1, Number(e.target.value) || 1)))}
                                    variant="bordered"
                                    className="text-center font-bold"
                                />
                                <Button
                                    type="button"
                                    variant="bordered"
                                    isIconOnly
                                    onPress={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500">Line Subtotal</p>
                                <p className="text-lg font-bold text-emerald-700">৳{Number(lineTotal).toLocaleString()}</p>
                            </div>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6"
                            >
                                <FiShoppingCart size={16} className="mr-1" /> Add to Bag
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}