'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    DrawerRoot,
    DrawerTrigger,
    DrawerBackdrop,
    DrawerContent,
    DrawerDialog,
    DrawerCloseTrigger,
    DrawerHeader,
    DrawerHeading,
    DrawerBody,
} from '@heroui/react';
import {
    FiHome,
    FiUsers,
    FiBox,
    FiLayers,
    FiGitBranch,
    FiClipboard,
    FiMenu,
    FiX,
    FiChevronRight,
    FiPackage,
    FiGrid,
    FiShoppingCart,
    FiFileText,
} from 'react-icons/fi';
import { CiSquareQuestion } from "react-icons/ci";
import { useSession } from '@/lib/auth-client';

const NAV_ITEMS = [
    {
        label: 'Home',
        href: '/',
        icon: FiHome,
        roles: ['owner', 'superadmin', 'admin', 'manager', 'cashier', 'staff'],
    },
    {
        label: 'Dashboard',
        getHref: (role) => `/dashboard/${role}`,
        icon: FiGrid,
        roles: ['owner', 'superadmin', 'admin', 'manager', 'cashier', 'staff'],
        exact: true,
    },
    {
        label: 'POS',
        href: '/dashboard/pos',
        icon: FiShoppingCart,
        roles: ['cashier'],
    },
    {
        label: 'Money Receipts',
        href: '/dashboard/all-receipt',
        icon: FiFileText,
        roles: ['owner', 'superadmin', 'admin', 'manager', 'cashier'],
    },
    {
        label: 'Branches',
        href: '/dashboard/owner/branches',
        icon: FiGitBranch,
        roles: ['owner'],
    },
    {
        label: 'Users',
        href: '/dashboard/users',
        icon: FiUsers,
        roles: ['owner', 'superadmin', 'admin', 'manager'],
    },
    {
        label: 'Products',
        href: '/dashboard/products',
        icon: FiBox,
        roles: ['owner', 'superadmin', 'admin', 'manager'],
    },
    {
        label: 'Branch Products',
        href: '/dashboard/manager/branch/products',
        icon: FiPackage,
        roles: ['manager'],
    },
    {
        label: 'Catalog Setup',
        href: '/dashboard/catalog',
        icon: FiLayers,
        roles: ['owner', 'superadmin', 'admin'],
    },
    {
        label: 'Branch Requests',
        href: '/dashboard/branch-requests',
        icon: CiSquareQuestion,
        roles: ['owner', 'superadmin', 'admin'],
    },
    {
        label: 'Stock Requests',
        href: '/dashboard/manager/request',
        icon: FiClipboard,
        roles: ['manager'],
    },
];

function isActive(pathname, href, exact) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
}

function visibleItems(role) {
    if (!role) return [];
    return NAV_ITEMS
        .filter(item => item.roles.includes(role))
        .map(item => ({
            ...item,
            href: item.getHref ? item.getHref(role) : item.href,
        }));
}

const ROLE_COLORS = {
    owner: 'bg-violet-100 text-violet-700',
    superadmin: 'bg-blue-100 text-blue-700',
    admin: 'bg-amber-100 text-amber-700',
    manager: 'bg-emerald-100 text-emerald-700',
    cashier: 'bg-gray-100 text-gray-600',
    staff: 'bg-gray-100 text-gray-600',
};

function RoleBadge({ role }) {
    if (!role) return null;
    const color = ROLE_COLORS[role] || 'bg-gray-100 text-gray-600';
    return (
        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color}`}>
            {role}
        </span>
    );
}

function NavList({ role, onNavigate }) {
    const pathname = usePathname();
    const items = visibleItems(role);

    if (items.length === 0) {
        return (
            <p className="text-xs text-gray-400 px-3 py-4">
                No navigation available for your role.
            </p>
        );
    }

    return (
        <nav className="flex flex-col gap-1">
            {items.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={[
                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                            active
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700',
                        ].join(' ')}
                    >
                        <Icon
                            size={17}
                            className={active
                                ? 'text-white'
                                : 'text-gray-400 group-hover:text-emerald-600 transition-colors'}
                        />
                        <span className="flex-1">{item.label}</span>
                        {active && <FiChevronRight size={14} className="text-white/70" />}
                    </Link>
                );
            })}
        </nav>
    );
}


function SidebarContent({ role, onNavigate }) {
    return (
        <div className="flex flex-col h-full">
            <div className="px-3 pb-4 mb-2 border-b border-gray-100">
                <p className="text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Signed in as</p>
                <RoleBadge role={role} />
            </div>
            <div className="flex-1 overflow-y-auto">
                <Suspense fallback={<div className="px-3 py-4 text-xs text-gray-400">Loading nav...</div>}>
                    <NavList role={role} onNavigate={onNavigate} />
                </Suspense>
            </div>
        </div>
    );
}


export default function Sidebar() {
    const { data: session } = useSession();
    const role = session?.user?.role;

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-0 self-start h-[calc(100vh-80px)] overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-4">
                <SidebarContent role={role} onNavigate={undefined} />
            </aside>

            <div className="md:hidden">
                <DrawerRoot
                    open={drawerOpen}
                    onOpenChange={(details) => setDrawerOpen(details.open)}
                >
                    <DrawerTrigger asChild>
                        <div
                            role="button"
                            tabIndex={0}
                            aria-label="Open navigation"
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDrawerOpen(true); }}
                            className="fixed bottom-5 left-5 z-40 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer select-none"
                        >
                            <FiMenu size={18} />
                            Menu
                        </div>
                    </DrawerTrigger>

                    <DrawerBackdrop />

                    <DrawerContent placement="left" className="w-72 max-w-[85vw]">
                        <DrawerDialog className="h-full flex flex-col bg-white">
                            <DrawerHeader className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <DrawerHeading className="text-base font-bold text-gray-900">
                                    Navigation
                                </DrawerHeading>
                                <DrawerCloseTrigger asChild>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Close navigation"
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDrawerOpen(false); }}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <FiX size={18} />
                                    </div>
                                </DrawerCloseTrigger>
                            </DrawerHeader>

                            <DrawerBody className="flex-1 overflow-y-auto px-4 py-4">
                                <SidebarContent
                                    role={role}
                                    onNavigate={() => setDrawerOpen(false)}
                                />
                            </DrawerBody>
                        </DrawerDialog>
                    </DrawerContent>
                </DrawerRoot>
            </div>
        </>
    );
}