'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from "@heroui/react";
import { FiPlus, FiTrash2, FiTag, FiLayers, FiFolder } from "react-icons/fi";
import toast from 'react-hot-toast';
import { getAllCategories, getAllVariantAttributes } from '@/lib/api/product';
import { actionCreateCategory, actionDeleteCategory, actionCreateVariantAttribute, actionDeleteVariantAttribute } from '@/lib/actions/product';
import { useSession } from '@/lib/auth-client';

export default function CatalogManagementPage() {
    const [categories, setCategories] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingCat, setSubmittingCat] = useState(false);
    const [submittingAttr, setSubmittingAttr] = useState(false);

    const { data: session } = useSession();
    const sessionUser = session?.user;

    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [attributeForm, setAttributeForm] = useState({ attributeName: '', valueInput: '' });

    const loadData = async () => {
        setLoading(true);
        const [catRes, attrRes] = await Promise.all([
            getAllCategories(),
            getAllVariantAttributes()
        ]);

        if (catRes && catRes.success) {
            setCategories(catRes.data || []);
        }
        if (attrRes && attrRes.success) {
            setAttributes(attrRes.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!categoryForm.name.trim()) return;

        setSubmittingCat(true);
        const toastId = toast.loading('Creating category...');

        try {
            const authorIdentifier = sessionUser?.employeeId || sessionUser?.email || 'System';
            const payload = {
                name: categoryForm.name,
                description: categoryForm.description,
                createdBy: authorIdentifier
            };

            const res = await actionCreateCategory(payload);
            if (res && res.success) {
                toast.success('Category created successfully!', { id: toastId });
                setCategoryForm({ name: '', description: '' });
                loadData();
            } else {
                toast.error(res?.message || 'Failed to create category.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred.', { id: toastId });
        } finally {
            setSubmittingCat(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        const toastId = toast.loading('Deleting category...');
        try {
            const res = await actionDeleteCategory(id);
            if (res && res.success) {
                toast.success('Category deleted successfully.', { id: toastId });
                loadData();
            } else {
                toast.error(res?.message || 'Failed to delete category.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'Error deleting category.', { id: toastId });
        }
    };

    const handleCreateAttribute = async (e) => {
        e.preventDefault();
        if (!attributeForm.attributeName.trim() || !attributeForm.valueInput.trim()) return;

        setSubmittingAttr(true);
        const toastId = toast.loading('Configuring attribute...');

        try {
            const valuesArray = attributeForm.valueInput.split(',').map(v => v.trim()).filter(Boolean);
            const authorIdentifier = sessionUser?.employeeId || sessionUser?.email || 'System';
            const payload = {
                attributeName: attributeForm.attributeName,
                values: valuesArray,
                createdBy: authorIdentifier
            };

            const res = await actionCreateVariantAttribute(payload);
            if (res && res.success) {
                toast.success('Variant attribute configured successfully!', { id: toastId });
                setAttributeForm({ attributeName: '', valueInput: '' });
                loadData();
            } else {
                toast.error(res?.message || 'Failed to configure attribute.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred.', { id: toastId });
        } finally {
            setSubmittingAttr(false);
        }
    };

    const handleDeleteAttribute = async (id) => {
        if (!confirm('Are you sure you want to delete this variant attribute?')) return;
        const toastId = toast.loading('Deleting attribute...');
        try {
            const res = await actionDeleteVariantAttribute(id);
            if (res && res.success) {
                toast.success('Attribute deleted successfully.', { id: toastId });
                loadData();
            } else {
                toast.error(res?.message || 'Failed to delete attribute.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'Error deleting attribute.', { id: toastId });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <FiLayers size={12} /> Catalog Setup & Configurations
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories & Variant Attributes</h1>
                    <p className="text-sm text-gray-500">Define product categories and variant pools (e.g., Size, Color) before registering master products.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <Card className="border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                        <FiFolder className="text-emerald-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">Manage Categories</h2>
                    </div>

                    <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Category Name</label>
                            <Input placeholder="e.g. Footwear" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required variant="bordered" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Description (Optional)</label>
                            <Input placeholder="e.g. Shoes and sandals" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} variant="bordered" />
                        </div>
                        <Button type="submit" isLoading={submittingCat} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                            <FiPlus size={16} /> Add Category
                        </Button>
                    </form>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800">Existing Categories</h3>
                        {loading ? (
                            <p className="text-xs text-gray-400">Loading categories...</p>
                        ) : categories.length === 0 ? (
                            <p className="text-xs text-gray-400">No categories added yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {categories.map((cat) => (
                                    <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                                            <p className="text-xs text-gray-500">{cat.description || 'No description'}</p>
                                        </div>
                                        <Button isIconOnly color="danger" variant="light" size="sm" onPress={() => handleDeleteCategory(cat._id)}>
                                            <FiTrash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                        <FiTag className="text-emerald-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">Manage Variant Attributes</h2>
                    </div>

                    <form onSubmit={handleCreateAttribute} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Attribute Type Name</label>
                            <Input placeholder="e.g. Size or Color" value={attributeForm.attributeName} onChange={(e) => setAttributeForm({ ...attributeForm, attributeName: e.target.value })} required variant="bordered" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Values (comma separated)</label>
                            <Input placeholder="e.g. 40, 41, 42, 43 or Red, Blue, Black" value={attributeForm.valueInput} onChange={(e) => setAttributeForm({ ...attributeForm, valueInput: e.target.value })} required variant="bordered" />
                        </div>
                        <Button type="submit" isLoading={submittingAttr} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                            <FiPlus size={16} /> Configure Attribute
                        </Button>
                    </form>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800">Configured Attributes</h3>
                        {loading ? (
                            <p className="text-xs text-gray-400">Loading attributes...</p>
                        ) : attributes.length === 0 ? (
                            <p className="text-xs text-gray-400">No variant attributes configured yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {attributes.map((attr) => (
                                    <div key={attr._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{attr.attributeName}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {attr.values?.map((val, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-medium border border-emerald-200">
                                                        {val}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <Button isIconOnly color="danger" variant="light" size="sm" onPress={() => handleDeleteAttribute(attr._id)}>
                                            <FiTrash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

            </div>
        </div>
    );
}