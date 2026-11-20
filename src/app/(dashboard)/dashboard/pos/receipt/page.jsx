'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, ListBox, Card } from "@heroui/react";
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiUser, FiPercent, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';
import { actionCreateCheckout } from '@/lib/actions/checkout';
import ReceiptDocument from '@/component/dashboard/pos/ReceiptDocument';

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

const getVariantAttributes = (item) => {
    const raw =
        Array.isArray(item?.variantAttributes) && item.variantAttributes.length > 0
            ? item.variantAttributes
            : Array.isArray(item?.attributes)
                ? item.attributes
                : [];

    return raw
        .map((attr) => {
            const variantName = String(attr?.variantName ?? attr?.attributeType ?? '').trim();
            const variantValue = String(attr?.variantValue ?? attr?.attributeValue ?? '').trim();
            if (!variantName && !variantValue) return null;
            return { variantName, variantValue };
        })
        .filter(Boolean);
};

export default function MoneyReceiptPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const sessionUser = session?.user;

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generatedReceipt, setGeneratedReceipt] = useState(null);

    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    const [discountPercentage, setDiscountPercentage] = useState('0');
    const [vatPercentage, setVatPercentage] = useState('0');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [note, setNote] = useState('');

    useEffect(() => {
        const saved = sessionStorage.getItem('freshmart_pos_cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setCart(parsed);
                    return;
                }
            } catch {
                // ignore
            }
        }
        router.replace('/dashboard/pos');
    }, [router]);

    const handlePaymentMethodChange = (selection) => {
        if (!selection) {
            setPaymentMethod('Cash');
            return;
        }
        if (typeof selection === 'string') {
            setPaymentMethod(selection);
            return;
        }
        const firstVal = Array.from(selection)[0];
        setPaymentMethod(firstVal ? String(firstVal) : 'Cash');
    };

    const subtotal = Number(
        cart.reduce((sum, item) => sum + Number(item.pricePerPiece) * Number(item.quantity), 0).toFixed(2)
    );
    const parsedDiscount = Math.max(0, Number(discountPercentage) || 0);
    const parsedVat = Math.max(0, Number(vatPercentage) || 0);

    const discountAmount = Number(((subtotal * parsedDiscount) / 100).toFixed(2));
    const taxableAmount = Number(Math.max(0, subtotal - discountAmount).toFixed(2));
    const vatAmount = Number(((taxableAmount * parsedVat) / 100).toFixed(2));
    const totalBill = Number((taxableAmount + vatAmount).toFixed(2));

    const handleGenerateReceipt = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setLoading(true);
        const toastId = toast.loading('Generating money receipt...');

        try {
            const payload = {
                branchId: sessionUser?.branchId || '',
                cashierId: sessionUser?.id || sessionUser?._id || '',
                cashierName: sessionUser?.name || 'Cashier',
                cashierEmail: sessionUser?.email || '',
                customer,
                items: cart.map((item) => ({
                    _id: item._id,
                    productType: item.productType || 'standard',
                    productName: item.productName,
                    variantSku: item.variantSku,
                    variantAttributes: getVariantAttributes(item),
                    variantLabel: getVariantText(item),
                    image: (Array.isArray(item.images) && item.images[0]) || '',
                    pricePerPiece: Number(item.pricePerPiece),
                    quantity: Number(item.quantity)
                })),
                discountPercentage: parsedDiscount,
                vatPercentage: parsedVat,
                paymentMethod,
                note
            };

            const res = await actionCreateCheckout(payload);

            if (res?.success) {
                toast.success('Money receipt created!', { id: toastId });
                sessionStorage.removeItem('freshmart_pos_cart');
                setGeneratedReceipt(res.data);
            } else {
                toast.error(res?.message || 'Failed to complete checkout.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleNewSale = () => {
        sessionStorage.removeItem('freshmart_pos_cart');
        router.push('/dashboard/pos');
    };

    if (generatedReceipt) {
        return (
            <div className="py-6">
                <ReceiptDocument receipt={generatedReceipt} onNewSale={handleNewSale} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 w-fit"
                >
                    <FiArrowLeft size={16} /> Back to POS Cart
                </button>
                <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900">Finalize Bill & Money Receipt</h1>
                    <p className="text-sm text-gray-500">Enter optional customer details, apply discount or VAT percentages, and generate the final receipt.</p>
                </div>
            </div>

            <form onSubmit={handleGenerateReceipt} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-6">
                    <Card className="p-6 border border-emerald-100 rounded-2xl bg-white space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <FiUser className="text-emerald-600" size={18} />
                            <h2 className="font-bold text-gray-900">
                                Customer Information <span className="text-xs font-normal text-gray-400">(Optional)</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Customer Name</label>
                                <Input
                                    placeholder="e.g. Mahmudul Hasan"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    variant="bordered"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                                <Input
                                    placeholder="e.g. +8801700000000"
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    variant="bordered"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="customer@example.com"
                                    value={customer.email}
                                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                    variant="bordered"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Address</label>
                                <Input
                                    placeholder="e.g. GEC Circle, Chattogram"
                                    value={customer.address}
                                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                    variant="bordered"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border border-emerald-100 rounded-2xl bg-white space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <FiPercent className="text-emerald-600" size={18} />
                            <h2 className="font-bold text-gray-900">Adjustments & Payment</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Discount (%)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="0"
                                    value={discountPercentage}
                                    onChange={(e) => setDiscountPercentage(e.target.value)}
                                    variant="bordered"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">VAT / Tax (%)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="0"
                                    value={vatPercentage}
                                    onChange={(e) => setVatPercentage(e.target.value)}
                                    variant="bordered"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Payment Method</label>
                                <Select
                                    selectedKey={paymentMethod}
                                    onSelectionChange={handlePaymentMethodChange}
                                    variant="bordered"
                                >
                                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            <ListBox.Item key="Cash" id="Cash" textValue="Cash">Cash<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="Card" id="Card" textValue="Card">Card<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="bKash" id="bKash" textValue="bKash">bKash<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="Nagad" id="Nagad" textValue="Nagad">Nagad<ListBox.ItemIndicator /></ListBox.Item>
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700">Receipt Note (Optional)</label>
                            <Input
                                placeholder="Any remarks for this receipt..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                variant="bordered"
                            />
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-5">
                    <Card className="p-6 border border-emerald-100 rounded-2xl bg-white shadow-xl shadow-emerald-950/5 space-y-5">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <FiFileText className="text-emerald-600" size={18} />
                            <h2 className="font-bold text-gray-900">Purchased Products Summary</h2>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                            {cart.map((item) => {
                                const lineCost = Number(item.pricePerPiece) * Number(item.quantity);
                                const variantText = getVariantText(item);

                                return (
                                    <div key={item.variantSku} className="py-2.5 flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.productName}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity} × ৳{Number(item.pricePerPiece).toLocaleString()}
                                                {variantText ? ` (${variantText})` : ''}
                                            </p>
                                        </div>
                                        <span className="font-bold text-gray-900">
                                            ৳{lineCost.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Total Cost of Products</span>
                                <span className="font-semibold">৳{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700">
                                <span>Discount ({parsedDiscount}%)</span>
                                <span>- ৳{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>VAT ({parsedVat}%)</span>
                                <span>+ ৳{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total Bill</span>
                                <span className="text-emerald-700">৳{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            isLoading={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base shadow-lg shadow-emerald-600/20"
                        >
                            Confirm & Generate Money Receipt
                        </Button>
                    </Card>
                </div>
            </form>
        </div>
    );
}