'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@heroui/react';
import { FiBox, FiDollarSign, FiTag, FiLayers, FiFolder } from 'react-icons/fi';
import Image from 'next/image';

export default function BranchProductDetailsModal({ isOpen, onOpenChange, product, categories = [] }) {
    const images = Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : ["https://i.ibb.co.com/JwgTBWgB/freshmart-logo.jpg"];

    const [currentProductId, setCurrentProductId] = useState(product?._id);
    const [selectedImage, setSelectedImage] = useState(images[0]);

    if (product?._id !== currentProductId) {
        setCurrentProductId(product?._id);
        setSelectedImage(images[0]);
    }

    if (!product) return null;

    const variantsList = Array.isArray(product?.variants) && product.variants.length > 0
        ? product.variants
        : [{
            _id: product._id,
            variantSku: product.variantSku || product.sku,
            size: product.size || 'Standard',
            color: product.color || 'Default',
            stock: product.stock ?? product.requestedStock ?? 0,
            pricePerPiece: product.pricePerPiece || product.pieceValue || 0
        }];

    const totalStockCount = product.totalStock ?? variantsList.reduce((sum, v) => sum + Number(v.stock || 0), 0);

    const matchedCategory = categories.find(
        (cat) => String(cat._id || cat.id) === String(product.categoryId || '')
    );
    const categoryName =
        product.categoryName ||
        (typeof product.category === 'object' ? product.category?.name : product.category) ||
        matchedCategory?.name ||
        'Uncategorized';

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog className="max-w-2xl bg-white p-6 rounded-xl shadow-xl">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading className="text-xl font-bold text-gray-900">
                                {product.productName || product.name}
                            </Modal.Heading>
                            <p className="text-sm text-gray-500 mt-1 font-mono">
                                {variantsList.length === 1
                                    ? `SKU: ${variantsList[0].variantSku}`
                                    : `${variantsList.length} Variants`}
                            </p>
                        </Modal.Header>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="aspect-square w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                                    <Image
                                        src={selectedImage}
                                        alt={product.productName || 'Product'}
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {images.length > 1 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                        {images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={`w-14 h-14 rounded-md overflow-hidden border-2 shrink-0 ${selectedImage === img ? 'border-blue-600' : 'border-transparent'}`}
                                            >
                                                <Image
                                                    src={img}
                                                    alt="thumb"
                                                    width={56}
                                                    height={56}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><FiBox /> Total Stock:</span>
                                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${totalStockCount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {totalStockCount} units
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><FiDollarSign /> Unit Price:</span>
                                        <span className="font-semibold text-gray-900">BDT {product.pricePerPiece || product.pieceValue || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><FiFolder /> Category:</span>
                                        <span className="font-medium text-gray-800">{categoryName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><FiTag /> Type:</span>
                                        <span className="uppercase text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                            {product.productType || 'Standard'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                        <FiLayers /> Variants Breakdown ({variantsList.length})
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {variantsList.map((v, idx) => (
                                            <div key={v._id || v.variantSku || idx} className="p-2.5 rounded-lg border border-gray-200 bg-white flex justify-between items-center text-xs">
                                                <div className="min-w-0 pr-2">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {v.color || 'Default'} — Size {v.size || 'Standard'}
                                                    </p>
                                                    <p className="font-mono text-gray-500 truncate mt-0.5">
                                                        SKU: {v.variantSku}
                                                    </p>
                                                </div>
                                                <span className={`font-bold px-2 py-0.5 rounded shrink-0 ${(v.stock ?? 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                                    {v.stock ?? 0} units
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Description</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed max-h-24 overflow-y-auto">
                                        {product.description || 'No description provided for this branch inventory item.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Modal.Footer className="mt-6 flex justify-end">
                            <Button variant="secondary" onPress={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}