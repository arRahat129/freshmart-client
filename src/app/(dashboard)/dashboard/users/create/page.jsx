import React from 'react';
import CreateUserForm from './CreateUserForm';
import { getAllBranches } from '@/lib/api/branch';

export default async function SharedCreateUserPage() {
    let branches = [];
    try {
        const res = await getAllBranches();
        branches = res?.data || [];
    } catch (err) {
        console.error("Failed to load branches:", err);
    }

    return <CreateUserForm branches={branches}/>;
}