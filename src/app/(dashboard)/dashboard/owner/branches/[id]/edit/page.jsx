import React from 'react';
import EditBranchForm from './EditBranchForm';
import { getBranchById } from '@/lib/api/branch';
import { getAllManagers } from '@/lib/api/manager';

export default async function EditBranchPage({ params }) {
    const { id } = await params;
    const [branchRes, managersRes] = await Promise.all([
        getBranchById(id),
        getAllManagers()
    ]);

    const branch = branchRes?.data;
    const managers = managersRes?.data || [];

    return <EditBranchForm branch={branch} managers={managers} branchId={id} />;
}