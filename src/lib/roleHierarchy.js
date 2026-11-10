
export const ROLE_RANK = {
    owner: 1,
    superadmin: 2,
    admin: 3,
    manager: 4,
    cashier: 5,
    staff: 6,
};

export const ALL_ROLES = [
    { key: 'owner',      label: 'Owner' },
    { key: 'superadmin', label: 'Super Admin' },
    { key: 'admin',      label: 'Admin' },
    { key: 'manager',    label: 'Manager' },
    { key: 'cashier',    label: 'Cashier' },
    { key: 'staff',      label: 'Staff / Employee' },
];

export const READ_ROLES = new Set(['owner', 'superadmin', 'admin', 'manager']);

export const CUD_ROLES = new Set(['owner', 'superadmin', 'admin']);

export function getRank(role) {
    return ROLE_RANK[role] ?? 99;
}


export function canManage(actorRole, targetRole) {
    return getRank(actorRole) < getRank(targetRole);
}

export function assignableRoles(actorRole) {
    const actorRank = getRank(actorRole);
    return ALL_ROLES.filter(r => (ROLE_RANK[r.key] ?? 99) > actorRank);
}

export function canReadUsers(actorRole) {
    return READ_ROLES.has(actorRole);
}

export function canCUDUsers(actorRole) {
    return CUD_ROLES.has(actorRole);
}
